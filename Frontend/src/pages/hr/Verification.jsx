import { useState, useEffect } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/Notice";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ReviewDialog from "../../components/feature/requirements/ReviewDialog";
import { useVerificationQueue } from "../../hooks/useVerificationQueue";
import { formatDate } from "../../domain/date";
//
import { useApp } from "../../hooks/useApp";
import { useQueryClient } from "@tanstack/react-query";
import { useRequirements } from "../../hooks/useRequirements";
import { usePendingDocuments } from "../../hooks/useDocuments";
import { capitalize } from "../../lib/capitalize";

/** Requirement verification queue — every submission awaiting HR review. */
export default function Verification() {
  const [review, setReview] = useState(null);
  const app = useApp();
  const queryClient = useQueryClient();
  //pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // from requirements hook
  const {
    data: requirements = [],
    isLoading: requirementsLoading,
    isError: requirementsError,
  } = useRequirements(app.session.accessToken);
  //from pendinDocuments Hook
  const {
    data: documents = [],
    isLoading: documentsLoading,
    isError: documentsError,
  } = usePendingDocuments(app.session.accessToken);

  // One list feeds the count, the table and the cards.
  const pending = requirements.filter(
    (req) =>
      req.status === "pending" &&
      req.employee.onboardingStatus !== "deactivated", //exclude requirements of deactivated users
  );
  /** File name(s) for a submission, rendered as before. */
  const filesFor = (req) => {
    const matchingDocuments = documents.filter(
      (doc) => doc.employeeRequirement?._id === req._id,
    );

    if (matchingDocuments.length === 0) {
      return "—";
    }

    return matchingDocuments.map((doc) => (
      <span key={doc._id ?? doc.fileName} className="truncate">
        {doc.fileName.length > 30
          ? `${doc.fileName.slice(0, 27)}...`
          : doc.fileName}
      </span>
    ));
  };

  // Reset to page 1 when search or department filter changes
  useEffect(() => {
    setPage(1);
  }, [requirements]);

  // Pagination calculations (after filtering)
  const totalPages = Math.max(1, Math.ceil(pending.length / pageSize));
  const startIndex = (page - 1) * pageSize;

  const paginatedRows = pending.slice(startIndex, startIndex + pageSize);

  const showing = `Showing ${
    pending.length === 0 ? 0 : startIndex + 1
  }–${Math.min(startIndex + pageSize, pending.length)} of ${
    pending.length
  } pending submissions`;

  //
  if (requirementsLoading || documentsLoading) {
    return <LoadingState />;
  }

  if (requirementsError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }

  if (documentsError) {
    return <ErrorState>Failed loading documents.</ErrorState>;
  }

  return (
    <>
      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Pending verification</h4>
          <span className="text-meta text-ink/55">
            {pending.length}{" "}
            {pending.length === 1 ? "submission" : "submissions"} in queue
          </span>
        </div>

        {pending.length ? (
          <>
            {/* lg and up: the existing table. */}
            <div className="hidden lg:block">
              <Table>
                <THead
                  columns={[
                    "Employee",
                    "Department",
                    "Requirement",
                    "File",
                    "Submitted",
                    "Deadline",
                    { label: "", align: "right" },
                  ]}
                />
                <tbody>
                  {paginatedRows.map((req) => (
                    <TRow key={req._id}>
                      <TCell strong>{req.employee.user.username}</TCell>
                      <TCell>{capitalize(req.employee.user.department)}</TCell>
                      <TCell>{req.requirement.name}</TCell>
                      <TCell className="font-heading text-cell text-accent-700">
                        {filesFor(req)}
                      </TCell>
                      <TCell>{formatDate(req.updatedAt)}</TCell>
                      <TCell>{formatDate(req.dueDate)}</TCell>
                      <TCell align="right">
                        <Button
                          variant="primary"
                          onClick={() => setReview(req)}
                        >
                          Review
                        </Button>
                      </TCell>
                    </TRow>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Below lg: one card per submission (two-up on tablets), same Review action. */}
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 md:grid md:grid-cols-2 lg:hidden">
              {paginatedRows.map((req) => (
                <li
                  key={req._id}
                  className="flex flex-col gap-3 border border-divider bg-bg/60 p-3.5"
                >
                  <div className="min-w-0">
                    <div className="break-words text-field font-medium">
                      {req.employee.user.username}
                    </div>
                    <div className="break-words text-cell text-ink/65">
                      {req.requirement.name} &middot;{" "}
                      {capitalize(req.employee.user.department)}
                    </div>
                  </div>
                  <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div className="col-span-2 min-w-0">
                      <dt className="text-micro uppercase text-ink/55">File</dt>
                      <dd className="m-0 break-all font-heading text-cell text-accent-700">
                        {filesFor(req)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-micro uppercase text-ink/55">
                        Submitted
                      </dt>
                      <dd className="m-0 text-cell">
                        {formatDate(req.updatedAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-micro uppercase text-ink/55">
                        Deadline
                      </dt>
                      <dd className="m-0 text-cell">
                        {formatDate(req.dueDate)}
                      </dd>
                    </div>
                  </dl>
                  <Button
                    variant="primary"
                    className="mt-auto min-h-11 w-full"
                    aria-label={`Review ${req.requirement.name} from ${req.employee.user.username}`}
                    onClick={() => setReview(req)}
                  >
                    Review
                  </Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1 text-meta text-ink/50">
                <span>{showing}</span>
              </div>

              <div className="flex items-center gap-2 max-md:w-full max-md:justify-between">
                <Button
                  aria-label="Previous page"
                  className="max-md:min-h-11 max-md:min-w-11"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft
                    size={16}
                    aria-hidden="true"
                    className="md:hidden"
                  />
                  <span className="max-md:hidden">Previous</span>
                </Button>

                <span className="whitespace-nowrap text-meta text-ink/70">
                  Page {page} of {totalPages}
                </span>

                <Button
                  aria-label="Next page"
                  className="max-md:min-h-11 max-md:min-w-11"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  <span className="max-md:hidden">Next</span>
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="md:hidden"
                  />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState>
            No submissions are waiting for review. New uploads from employees
            will appear here.
          </EmptyState>
        )}
      </Card>

      <ReviewDialog
        target={review}
        getReqFromVerify={() =>
          queryClient.invalidateQueries({
            queryKey: ["requirements"],
          })
        }
        onClose={() => setReview(null)}
      />
    </>
  );
}
