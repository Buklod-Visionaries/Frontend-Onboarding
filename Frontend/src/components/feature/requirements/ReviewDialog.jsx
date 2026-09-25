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
import api from "../../../lib/axios";
import { formatRole } from "../../../lib/formatter";

function ReviewDialogBody({
  employee,
  requirement,
  empReq,
  onClose,
  getReqFromEmpProfile,
  getReqFromDashboard,
}) {
  const app = useApp();
  const [resubmitMode, setResubmitMode] = useState(false);
  const [reason, setReason] = useState("");
  const [documentPreview, setDocumentPreview] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [resubmitLoading, setResubmitLoading] = useState(false);

  useEffect(() => {
    async function getSpecificDocument() {
      try {
        setDocLoading(true);
        const res = await api.get(
          `/documents/employee-requirement/${empReq._id}`,
          {
            headers: {
              Authorization: `Bearer ${app.session.accessToken}`,
            },
          },
        );
        setDocumentPreview(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      } finally {
        setDocLoading(false);
      }
    }
    getSpecificDocument();
  }, []);

  const approve = async () => {
    await app.approveRequirement(empReq, setApproveLoading);

    onClose();

    //refreshes requirements list to reflect new changes
    await getReqFromEmpProfile?.();
    await getReqFromDashboard?.();
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
    app.requestResubmission(empReq, reason, setResubmitLoading);
    onClose();

    //refreshes requirements list to reflect new changes
    await getReqFromEmpProfile?.();
    await getReqFromDashboard?.();
  };

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
        <>
          {empReq.status === "pending" && (
            <>
              <Button onClick={onClose}>Cancel</Button>
              {documentPreview && (
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
      }
    >
      <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr]">
        {requirement.type === "document" && (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2">
            {docLoading || !documentPreview ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <a
                href={documentPreview.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full w-full cursor-pointer"
              >
                <iframe
                  src={`${documentPreview.fileUrl}#toolbar=0&navpanes=0`}
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
            {empReq.verifiedBy && (
              <>
                <dt className="text-ink/50">Approved By</dt>
                <dd className="m-0">
                  {empReq.verifiedBy.username} -
                  {formatRole(empReq.verifiedBy.role)}
                </dd>
              </>
            )}
          </dl>

          {resubmitMode && (
            <Field label="Reason for resubmission (sent to the employee)">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The uploaded scan is cut off. Please upload a full copy of the document."
              />
            </Field>
          )}
        </div>
      </div>
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
      onClose={onClose}
    />
  );
}
