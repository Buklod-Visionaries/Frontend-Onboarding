import { useState, useEffect } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import { Field, Textarea } from "../../ui/Field";
import { formatDate } from "../../../domain/date";
import { useApp } from "../../../hooks/useApp";
import { capitalize } from "../../../lib/capitalize";
//
import Card from "../../ui/Card";
import { EventList } from "../../ui/Timeline";
import api from "../../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useExistingDocument } from "../../../hooks/useDocuments";
import { useSpecificEmpReqHistories } from "../../../hooks/useRequirementHistories";
import { formatRole } from "../../../lib/formatter";

function ReviewDialogBody({
  employee,
  requirement,
  empReq,
  onClose,
  getReqFromEmpProfile,
  getReqFromDashboard,
  getReqFromVerify,
}) {
  const app = useApp();
  const queryClient = useQueryClient();
  const [resubmitMode, setResubmitMode] = useState(false);
  const [reason, setReason] = useState("");

  const [approveLoading, setApproveLoading] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);

  const {
    data: existingDocument = [],
    isLoading: existingDocumentLoading,
    isError: existingDocumentError,
  } = useExistingDocument(app.session.accessToken, empReq._id);
  const {
    data: specificEmpReqHistories = [],
    isLoading: specificEmpReqHistoriesLoading,
    isError: specificEmpReqHistoriesError,
  } = useSpecificEmpReqHistories(app.session.accessToken, empReq._id);

  const approve = async () => {
    await app.approveRequirement(empReq, setApproveLoading);

    window.dispatchEvent(new Event("requirements-updated"));

    onClose();

    //refreshes requirements list to reflect new changes
    await getReqFromEmpProfile?.();
    await getReqFromDashboard?.();
    await getReqFromVerify?.();
  };

  const resubmit = async () => {
    if (!resubmitMode) {
      setResubmitMode(true);
      return;
    }
    if (!reason.trim()) {
      app.showToast(
        "Add a short reason so the employee knows what to correct.",
      );
      return;
    }
    await app.requestResubmission(empReq, reason, setResubmitLoading);

    window.dispatchEvent(new Event("requirements-updated"));

    onClose();

    //refreshes requirements list to reflect new changes
    await getReqFromEmpProfile?.();
    await getReqFromDashboard?.();
    await getReqFromVerify?.();
  };
  // if (specificEmpReqHistoriesLoading || existingDocumentLoading) {
  //   return <p>Loading...</p>;
  // }

  if (existingDocumentError) {
    return <p>Failed loading document.</p>;
  }
  if (specificEmpReqHistoriesError) {
    return <p>Failed loading history.</p>;
  }

  // console.log("documentFIle", documentPreview);
  return (
    <Modal
      open
      onClose={onClose}
      width="max-w-[800px]"
      kicker="Requirement verification"
      title={requirement.name}
      subtitle={`${employee.user.username} · ${capitalize(employee.position)} · ${capitalize(employee.department)}`}
      actions={
        specificEmpReqHistoriesLoading || existingDocumentLoading ? (
          ""
        ) : (
          <>
            {empReq.status === "pending" && (
              <>
                <Button onClick={onClose}>Cancel</Button>
                {existingDocument && (
                  <>
                    <Button onClick={resubmit} disabled={resubmitLoading}>
                      {resubmitMode
                        ? resubmitLoading
                          ? "Sending request..."
                          : "Send resubmission request"
                        : "Request resubmission"}
                    </Button>
                    {!resubmitMode && (
                      <Button
                        variant="primary"
                        disabled={approveLoading}
                        onClick={approve}
                      >
                        {approveLoading
                          ? "Approving..."
                          : `Approve & mark completed`}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
            {empReq.status === "completed" && (
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            )}
          </>
        )
      }
    >
      {specificEmpReqHistoriesLoading || existingDocumentLoading ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
          {requirement.type === "document" && (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2">
              {existingDocumentLoading ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <a
                  href={existingDocument.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-full w-full cursor-pointer"
                >
                  <iframe
                    src={`${existingDocument.fileUrl}#toolbar=0&navpanes=0`}
                    className="pointer-events-none h-full w-full border-none"
                    title="Document preview"
                  />
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <dl
              className="grid gap-2 text-cell"
              style={{ gridTemplateColumns: "110px 1fr" }}
            >
              <dt className="text-ink/50">Type</dt>
              <dd className="m-0">{capitalize(requirement.type)}</dd>
              <dt className="text-ink/50">Submitted</dt>
              <dd className="m-0">{formatDate(empReq.updatedAt)}</dd>
              <dt className="text-ink/50">Deadline</dt>
              <dd className="m-0">{formatDate(empReq.dueDate)}</dd>
              <dt className="text-ink/50">Status</dt>
              <dd className="m-0">
                <Badge
                  variant={
                    empReq.status === "in-progress" ||
                    empReq.status === "resubmission-required"
                      ? "pending"
                      : empReq.status === "completed"
                        ? "completed"
                        : empReq.status === "pending" && "in-progress"
                  }
                >
                  {capitalize(empReq.status)}
                </Badge>
              </dd>
              {empReq.verifiedBy && empReq.status === "completed" && (
                <>
                  <dt className="text-ink/50">Approved By</dt>
                  <dd className="m-0">
                    {empReq.verifiedBy.username} -{" "}
                    {formatRole(empReq.verifiedBy.role)}
                  </dd>
                </>
              )}
            </dl>

            {resubmitMode ? (
              <Field label="Reason for resubmission (sent to the employee)">
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. The uploaded scan is cut off. Please upload a full copy of the document."
                />
              </Field>
            ) : (
              <Card padding="lg" className="gap-3.5">
                <h4 className="text-[20px]">Submission history</h4>
                <EventList
                  items={
                    specificEmpReqHistories.length > 0
                      ? specificEmpReqHistories
                      : [{ note: "No submissions yet", time: "—" }]
                  }
                />
              </Card>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/**
 * HR document review: approve, or send back for resubmission with a reason.
 * `target` is `{ employee, requirement }`, or null when closed.
 *
 * The body is keyed on the requirement so opening a different submission mounts
 * a fresh form rather than carrying the previous reason across.
 */
export default function ReviewDialog({
  target,
  onClose,
  getReqFromEmpProfile,
  getReqFromDashboard,
  getReqFromVerify,
}) {
  if (!target) return null;
  return (
    <ReviewDialogBody
      key={target.requirement.id}
      employee={target.employee}
      requirement={target.requirement}
      empReq={target}
      getReqFromEmpProfile={getReqFromEmpProfile}
      getReqFromDashboard={getReqFromDashboard}
      getReqFromVerify={getReqFromVerify}
      onClose={onClose}
    />
  );
}
