import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import AutoGrid from "../../components/ui/AutoGrid";
import DividerList, { DividerRow } from "../../components/ui/DividerList";
import Notice, { SectionHeading } from "../../components/ui/Notice";
import { Field, Input, Select } from "../../components/ui/Field";
import AccountCreatedDialog from "../../components/feature/accounts/AccountCreatedDialog";
import { useApp } from "../../hooks/useApp";
//
import { RefreshCcw, Info } from "lucide-react";
import { CopyButton } from "../../components/ui/CopyField";
import { generatePassword } from "../../lib/generateTempPassword";
import { handlePhoneChange } from "../../lib/validator";
import api from "../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Add Employee: employee information, position + department, account information.
 * Creating the record creates the account and assigns the requirements together.
 */
export default function AddEmployee() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [tempPass, setTempPass] = useState(generatePassword());

  const departments = [
    "Select department",
    "Laboratory",
    "Imaging",
    "Cardiovascular",
    "Administration",
  ];
  const [dep, setDep] = useState(departments[0]);

  //
  const nameRef = useRef(null);
  const startDateRef = useRef(null);
  const positionRef = useRef(null);
  const departmentRef = useRef(null);
  const emailRef = useRef(null);

  const isValidWorkEmail = (value) => /^[^\s@]+@pmcl\.ph$/i.test(value.trim());

  async function getAllRequirementsTemplate() {
    try {
      setLoadingReq(true);
      const res = await api.get("/requirements", {
        headers: {
          Authorization: `Bearer ${app.session.accessToken}`,
        },
      });
      setRequirements(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    } finally {
      setLoadingReq(false);
    }
  }

  useEffect(() => {
    getAllRequirementsTemplate();
  }, []);

  const submit = async () => {
    const validations = [
      {
        valid: !!name.trim(),
        ref: nameRef,
        message: "Please enter the employee's full name.",
      },
      {
        valid: !!startDate && !Number.isNaN(new Date(startDate).getTime()),
        ref: startDateRef,
        message: !startDate
          ? "Please select the employee's start date."
          : "Please enter a valid start date.",
      },
      {
        valid: !!position.trim(),
        ref: positionRef,
        message: "Please enter the employee's position.",
      },
      {
        valid: dep !== "Select department",
        ref: departmentRef,
        message: "Please select a department.",
      },
      {
        valid: isValidWorkEmail(email),
        ref: emailRef,
        message: !email.trim()
          ? "Please enter the employee's work email."
          : "Use a valid work email ending in @pmcl.ph.",
      },
    ];

    const invalidField = validations.find((field) => !field.valid);

    if (invalidField) {
      app.showToast(invalidField.message, {
        type: "warning",
      });
      invalidField.ref.current?.focus();
      return;
    }

    if (!tempPass) {
      app.showToast("Temporary password is missing. Generate a new password.", {
        type: "error",
      });
      return;
    }

    const empReq = requirements.filter(
      (req) => req.department === dep.toLowerCase(),
    ).length;

    const payload = {
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      position: position.trim(),
      department: dep,
      email: email.trim().toLowerCase(),
      tempPass,
      empReq,
    };

    try {
      const createdEmployee = await app.createEmployee({
        setLoadingSubmit,
        ...payload,
      });

      if (!createdEmployee) return;

      setReceipt(createdEmployee);

      await queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        app.showToast(message || "An account with this email already exists.", {
          type: "error",
        });
        emailRef.current?.focus();
      } else if (!error.response) {
        app.showToast(
          "Unable to connect to the server. Check your connection and try again.",
          {
            type: "error",
          },
        );
      } else {
        app.showToast(
          message || "Failed to create the employee account. Please try again.",
          {
            type: "error",
          },
        );
      }
    }
  };

  return (
    <>
      <AutoGrid min={320} className="items-start">
        <Card padding="lg" className="gap-4">
          <SectionHeading step="01">Employee information</SectionHeading>
          <p className="-mt-1.5 m-0 text-meta text-ink/55">
            Fields marked * are required.
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Full name *">
              <Input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
              />
            </Field>
            {/* <Field label="Mobile number">
              <Input
                value={phone}
                onChange={(e) => handlePhoneChange(e, setPhone)}
                placeholder="+63 9XX XXX XXXX"
              />
            </Field> */}
            <Field label="Start date *">
              <Input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
          </div>

          <SectionHeading step="02">Position &amp; department</SectionHeading>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Position *">
              <Input
                ref={positionRef}
                value={position}
                placeholder="e.g. Medical Technologist"
                onChange={(e) => setPosition(e.target.value)}
              />
            </Field>
            <Field label="Department *">
              <Select
                ref={departmentRef}
                value={dep}
                options={departments}
                onChange={(e) => setDep(e.target.value)}
              />
            </Field>
          </div>
          <Notice>
            The department determines which onboarding requirements are assigned
            &mdash; see the list on the right before creating the record.
          </Notice>

          <SectionHeading step="03">Account information</SectionHeading>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Work email *">
              <Input
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@pmcl.ph"
              />
            </Field>
            <Field label="Role">
              <Input value="Employee" readOnly />
            </Field>
            <div className="flex flex-row items-end gap-2">
              <Field label="Temporary password" className="min-w-0 flex-1">
                <Input value={tempPass} readOnly />
              </Field>
              {/* A real button (same handler) so it is keyboard-reachable and labelled. */}
              <button
                type="button"
                aria-label="Generate a new temporary password"
                title="Generate a new temporary password"
                onClick={() => setTempPass(generatePassword())}
                className="group flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-control border border-divider text-ink/70 transition-colors hover:bg-ink/[0.07] hover:text-ink max-sm:size-10"
              >
                <RefreshCcw
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-rotate-90 motion-reduce:transition-none"
                />
              </button>
              <CopyButton
                value={tempPass}
                label="temporary password"
                onError={() =>
                  app.showToast(
                    "Could not copy — select the password and copy it manually.",
                    {
                      type: "error",
                    },
                  )
                }
              />
            </div>
            <Field label="Account status on creation">
              <Input value="Pending first login" readOnly />
            </Field>
          </div>
          <span className="text-meta text-ink/55">
            The employee is required to set a new password on first login.
          </span>

          {/* Phones: actions stack full width (primary on top) and may wrap. */}
          <div className="flex flex-wrap justify-end gap-2.5 max-sm:flex-col-reverse max-sm:[&>*]:w-full max-sm:[&>*]:whitespace-normal">
            <Button onClick={() => navigate("/hr/employees")}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={loadingSubmit}>
              {loadingSubmit
                ? "Creating employee account..."
                : "Create employee account & assign requirements"}
            </Button>
          </div>
        </Card>

        <Card padding="lg" className=" gap-3.5">
          <div>
            <div className="text-micro uppercase text-accent-700">
              Automatic assignment
            </div>
            <h4 className="mt-1 text-[20px]">
              Requirements for this department
            </h4>
          </div>

          {dep === "Select department" ? (
            // Ghost Skeleton List Empty State
            <div className="flex flex-col gap-4 flex-1">
              <p className="m-0 text-cell text-ink/60">
                Select a department to see the requirements that will be
                assigned.
              </p>

              {/* Animated Skeleton List */}
              <DividerList className="animate-pulse opacity-40 pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((index) => (
                  <DividerRow
                    key={index}
                    className="flex items-center gap-2.5 px-3 py-3"
                  >
                    {/* Fake Checkmark */}
                    <div className="w-3.5 h-3.5 rounded-full bg-ink/20" />

                    {/* Fake Name (Randomized widths for a natural look) */}
                    <div
                      className="h-3.5 bg-ink/20 rounded"
                      style={{ width: index % 2 === 0 ? "45%" : "60%" }}
                    />

                    {/* Fake Type */}
                    <div className="w-12 h-2.5 bg-ink/15 rounded" />
                  </DividerRow>
                ))}
              </DividerList>
            </div>
          ) : (
            // Active State with content
            <>
              <p className="m-0 text-cell text-ink/60">
                {
                  requirements.filter(
                    (req) => req.department === dep.toLowerCase(),
                  ).length
                }{" "}
                requirements are assigned automatically for employees in {dep}{" "}
                department. HR can adjust them afterwards on the employee
                record.
              </p>

              <DividerList>
                {requirements
                  .filter((req) => req.department === dep.toLowerCase())
                  .map((requirement) => (
                    <DividerRow
                      key={requirement._id}
                      className="flex items-center gap-2.5 px-3 py-2.5"
                    >
                      <span className="text-cell text-accent">✓</span>
                      <span className="flex-1 text-field">
                        {requirement.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-ink/45">
                        {requirement.type}
                      </span>
                    </DividerRow>
                  ))}
              </DividerList>
            </>
          )}
        </Card>
      </AutoGrid>

      <AccountCreatedDialog
        receipt={receipt}
        onClose={() => {
          setReceipt(null);
          navigate("/hr/employees");
        }}
      />
    </>
  );
}
