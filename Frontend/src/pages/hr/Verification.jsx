import { useState, useEffect } from "react";
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

  //
  if (requirementsLoading || documentsLoading) {
    return <p>Loading...</p>;
  }

  if (requirementsError) {
    return <p>Failed loading requirements.</p>;
  }

  if (documentsError) {
    return <p>Failed loadin docs.</p>;
  }

  return (
    <>
      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Pending verification</h4>
          <span className="text-meta text-ink/55">
            {requirements.filter((req) => req.status === "pending").length}{" "}
            {requirements.filter((req) => req.status === "pending").length === 1
              ? "submission"
              : "submissions"}{" "}
            in queue
          </span>
        </div>

        {requirements.length ? (
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
              {requirements
                .filter((req) => req.status === "pending")
                .map((req) => (
                  <TRow key={req._id}>
                    <TCell strong>{req.employee.user.username}</TCell>
                    <TCell>{capitalize(req.employee.user.department)}</TCell>
                    <TCell>{req.requirement.name}</TCell>
                    <TCell className="font-heading text-cell text-accent-700">
                      {documents
                        .filter(
                          (doc) => doc.employeeRequirement._id === req._id,
                        )
                        .map((doc) => <span>{doc.fileName}</span>) || "—"}
                    </TCell>
                    <TCell>{formatDate(req.updatedAt)}</TCell>
                    <TCell>{formatDate(req.dueDate)}</TCell>
                    <TCell align="right">
                      <Button variant="primary" onClick={() => setReview(req)}>
                        Review
                      </Button>
                    </TCell>
                  </TRow>
                ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>No submissions are waiting for review.</EmptyState>
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
