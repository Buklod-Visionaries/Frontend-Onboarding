import { useEffect, useRef, useState } from "react";
import { LoadingState, ErrorState } from "../../components/ui/StatusMessage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { OverdueBadge } from "../../components/ui/Badge";
import AutoGrid from "../../components/ui/AutoGrid";
import Notice from "../../components/ui/Notice";
import { EventList } from "../../components/ui/Timeline";
import { cx } from "../../lib/cx";
import { useApp } from "../../hooks/useApp";
import { formatDate, isOverdue } from "../../domain/date";
import { REQUIREMENT_DESCRIPTIONS } from "../../data/positions";
//
import { useQueryClient } from "@tanstack/react-query";
import { useMySpecificRequirement } from "../../hooks/useRequirements";
import { useExistingDocument } from "../../hooks/useDocuments";
import { useSpecificEmpReqHistories } from "../../hooks/useRequirementHistories";
import { formatStatus } from "../../lib/formatter";

/** Requirement details + document upload / resubmission. */
export default function RequirementDetail() {
  const app = useApp();
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Back to the list with the status filter it was opened from, if any.
  const backToList = () =>
    navigate(`/employee/requirements${location.state?.listSearch ?? ""}`);
  const fileInput = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  //from myRequirement hook
  const {
    data: myRequirement = [],
    isLoading: myRequirementLoading,
    isError: myRequirementError,
  } = useMySpecificRequirement(app.session.accessToken, params.id);
  //from existingDoc hook
  const {
    data: existingDocument = [],
    isLoading: existingDocumentLoading,
    isError: existingDocumentError,
  } = useExistingDocument(app.session.accessToken, params.id);
  //from specificEMpReqHistories hook
  const {
    data: specificEmpReqHistories = [],
    isLoading: specificEmpReqHistoriesLoading,
    isError: specificEmpReqHistoriesError,
  } = useSpecificEmpReqHistories(app.session.accessToken, myRequirement._id);
  const [fileUploading, setFileUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Local preview of the chosen (not yet submitted) file, via an object URL.
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewRef = useRef(null);
  function setPreview(file) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = file ? URL.createObjectURL(file) : null;
    setPreviewUrl(previewRef.current);
  }
  // Free the last preview URL when leaving the page.
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  function handleFile(file) {
    if (!file) return;

    // Check file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      app.showToast("Only PDF, JPG, JPEG, and PNG files are allowed.", {
        type: "error",
      });
      setPendingFile(null);
      setPreview(null);
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      app.showToast("File size must not exceed 10 MB.", {
        type: "error",
      });
      setPendingFile(null);
      setPreview(null);
      return;
    }

    setPendingFile(file);
    setPreview(file);
    //show toast saying to users that file is chosen
    app.showToast(
      `${file.name} is ready to upload. Please click Submit document to upload it.`, {
        type: "success",
      }
    );
  }

  async function uploadFile({ e, id }) {
    // e.preventDefault();
    try {
      //test bugfix
      if (!pendingFile) return;
      setFileUploading(true);

      //sends the file and target requirement
      await app.submitDocument(pendingFile, id);
      setPendingFile("");
      setPreview(null);
      queryClient.invalidateQueries({
        queryKey: ["myRequirements"],
      });
      queryClient.invalidateQueries({
        queryKey: ["myRequirement", params.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["existingDocument", params.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["specificEmpReqHistories", myRequirement._id],
      });
    } catch (error) {
      app.showToast(`Failed uploading File: ${error.response.data.message}`, {
        type: "error",
      });
      console.log("failed uploading file:", error);
    } finally {
      setFileUploading(false);
    }
  }

  ////
  if (
    myRequirementLoading ||
    existingDocumentLoading ||
    specificEmpReqHistoriesLoading
  ) {
    return <LoadingState />;
  }

  if (myRequirementError) {
    return <ErrorState>Failed loading requirements.</ErrorState>;
  }
  if (existingDocumentError) {
    return <ErrorState>Failed loading document.</ErrorState>;
  }
  if (specificEmpReqHistoriesError) {
    return <ErrorState>Failed loading requirements history.</ErrorState>;
  }

  if (!myRequirement) {
    return (
      <Card>
        <p className="m-0 text-field">That requirement does not exist.</p>
        <Button className="mt-3 self-start" onClick={backToList}>
          Back to requirements
        </Button>
      </Card>
    );
  }

  const uploadable = myRequirement.status !== "completed";

  const uploadLabel = pendingFile
    ? `Selected: ${pendingFile.name}`
    : myRequirement.status === "completed"
      ? myRequirement.file
      : "Choose a file to submit";

  return (
    <AutoGrid min={320} className="items-start">
      <Card padding="lg" className="gap-4">
        <Button
          variant="ghost"
          className="-ml-2 self-start px-2"
          onClick={backToList}
        >
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          Back to requirements
        </Button>
        <div>
          <div className="text-micro uppercase text-accent-700">
            {myRequirement.type}
          </div>
          <h2 className="mb-2 mt-1 break-words text-[24px] sm:text-[30px]">
            {myRequirement.requirement.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                myRequirement.status === "in-progress" ||
                myRequirement.status === "resubmission-required"
                  ? "pending"
                  : myRequirement.status === "completed"
                    ? "completed"
                    : myRequirement.status === "pending" && "in-progress"
              }
            >
              {formatStatus(myRequirement.status)}
            </Badge>
            <span className="text-meta text-ink/55">
              Deadline {formatDate(myRequirement.dueDate)}
            </span>
            {myRequirement.status === "pending" && (
              <>
                {" "}
                |
                <span className="text-meta text-ink/55">
                  Submitted at {formatDate(myRequirement.updatedAt)}
                </span>
              </>
            )}
            <OverdueBadge
              when={
                isOverdue(formatDate(myRequirement.dueDate)) &&
                myRequirement.status !== "completed" &&
                myRequirement.status !== "pending"
              }
            />
          </div>
        </div>

        <p className="m-0 text-field leading-relaxed text-ink/70">
          {REQUIREMENT_DESCRIPTIONS[myRequirement.requirement.name] ||
            "Submit this requirement to the HR Department for verification."}
        </p>

        {myRequirement.resubmissionReason &&
          myRequirement.status !== "completed" && (
            <Notice title="Resubmission requested">
              {myRequirement.resubmissionReason} -{" "}
              {myRequirement.verifiedBy.username}
            </Notice>
          )}

        <div className="flex flex-col gap-2.5">
          <span className="text-micro uppercase text-ink/50">Submission</span>
          {myRequirement.status === "in-progress" ||
          myRequirement.status === "resubmission-required" ? (
            <div
              className={cx(
                "flex flex-col items-center gap-1.5 border border-dashed p-4 text-center transition sm:p-6",
                isDragging
                  ? "border-accent bg-accent/5"
                  : uploadable
                    ? "border-ink/30"
                    : "border-ink/[0.18] opacity-55",
              )}
              onDragOver={(e) => {
                e.preventDefault();

                if (uploadable) {
                  setIsDragging(true);
                }
              }}
              onDragLeave={() => {
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);

                if (!uploadable) return;

                const file = e.dataTransfer.files?.[0];

                if (file) {
                  handleFile(file);
                }
              }}
            >
              <Upload size={26} strokeWidth={1.5} className="text-accent" />

              <div className="max-w-full break-all text-field">
                {uploadLabel}
              </div>

              <div className="text-meta text-ink/50">
                PDF, JPG or PNG &middot; max 10 MB
              </div>

              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    handleFile(file);
                  }

                  // Allows the same file to be selected again
                  e.target.value = "";
                }}
              />

              {/* Preview of the chosen file before it is submitted. */}
              {pendingFile && previewUrl && (
                <div className="mt-2 w-full">
                  {pendingFile.type === "application/pdf" ? (
                    <iframe
                      src={`${previewUrl}#toolbar=0&navpanes=0`}
                      title={`Preview of ${pendingFile.name}`}
                      className="mx-auto block aspect-[1/1.2941] max-h-[70vh] w-full max-w-lg border border-divider bg-white"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt={`Preview of ${pendingFile.name}`}
                      className="mx-auto block max-h-[60vh] w-auto max-w-full border border-divider bg-white object-contain"
                    />
                  )}
                </div>
              )}

              {existingDocument && (
                <div className="mt-1.5 flex flex-wrap justify-center gap-2.5 max-sm:w-full max-sm:flex-col-reverse max-sm:[&>*]:w-full">
                  <Button
                    disabled={!uploadable || fileUploading}
                    onClick={() => fileInput.current?.click()}
                  >
                    Choose file
                  </Button>

                  {myRequirement.status !== "pending" && (
                    <Button
                      variant="primary"
                      disabled={!uploadable || !pendingFile || fileUploading}
                      onClick={(e) => uploadFile({ e, id: myRequirement._id })}
                    >
                      {fileUploading
                        ? "Submitting..."
                        : myRequirement.file
                          ? "Resubmit document"
                          : "Submit document"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : !existingDocument ? (
            <LoadingState />
          ) : (
            <div className="mx-auto aspect-[1/1.2941] w-full max-w-lg">
              <a
                href={existingDocument.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full w-full cursor-pointer"
              >
                <iframe
                  src={`${existingDocument.fileUrl}#toolbar=0&navpanes=0`}
                  className="pointer-events-auto h-full w-full border-none overflow-auto"
                  title="Document preview"
                />
              </a>
            </div>
          )}
        </div>
      </Card>

      <Card padding="lg" className="gap-3.5">
        <h4 className="text-[20px]">Submission history</h4>
        <EventList
          items={
            specificEmpReqHistories.length > 0
              ? specificEmpReqHistories
              : [{ note: "No submissions yet", time: "—" }]
          }
          history
        />
      </Card>
    </AutoGrid>
  );
}
