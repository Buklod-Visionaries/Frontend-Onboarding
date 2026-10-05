import { useState } from "react";
import * as XLSX from "xlsx";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { StatStrip } from "../../components/ui/StatCard";
import { Field, Select } from "../../components/ui/Field";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { DEPARTMENTS } from "../../domain/constants";
import { useApp } from "../../hooks/useApp";
import { formatDepartment } from "../../lib/formatter";
import { useReports } from "../../hooks/useReports";

export default function Reports() {
  const app = useApp();

  const [department, setDepartment] = useState("All");
  const [generated, setGenerated] = useState(false);

  const {
    data: reports = [],
    isLoading,
    isError,
  } = useReports(app.session.accessToken, department.toLowerCase());

  const totals = reports.reduce(
    (acc, employee) => {
      acc.completed += employee.completed;
      acc.inProgress += employee.inProgress;
      acc.pending += employee.pending;

      return acc;
    },
    {
      completed: 0,
      inProgress: 0,
      pending: 0,
    },
  );

  const totalRequirements =
    totals.completed + totals.inProgress + totals.pending;

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleExportExcel = () => {
    if (!reports.length) return;

    const excelData = reports.map((employee) => ({
      Employee: employee.employee,
      Position: employee.position,
      Department: formatDepartment(employee.department),
      Completed: employee.completed,
      "In Progress": employee.inProgress,
      Pending: employee.pending,
      Total: employee.total,
      Status:
        employee.onboardingStatus === "in_progress"
          ? "In Progress"
          : employee.onboardingStatus === "resubmission-required"
            ? "Resubmission Required"
            : employee.onboardingStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const departmentName =
      department === "All" ? "All-Departments" : formatDepartment(department);

    const fileName = `Onboarding-Report-${departmentName}-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Department" className="min-w-[180px]">
          <Select
            value={department}
            options={[
              { value: "All", label: "All departments" },
              ...DEPARTMENTS,
            ]}
            onChange={(e) => {
              setDepartment(e.target.value);
              setGenerated(false);
            }}
          />
        </Field>

        <Button variant="primary" onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate report"}
        </Button>

        {generated && !isLoading && !isError && reports.length > 0 && (
          <Button variant="secondary" onClick={handleExportExcel}>
            Export Excel
          </Button>
        )}
      </div>

      {generated && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-2.5 border-t border-divider pt-4">
            <h4 className="text-[20px]">
              {department === "All"
                ? "All departments"
                : formatDepartment(department)}{" "}
              Reports
            </h4>

            <span className="text-[11px] text-ink/50">
              Generated {new Date().toLocaleString()}
            </span>
          </div>

          {isLoading && (
            <div className="py-8 text-center text-ink/50">
              Loading report...
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-red-500">
              Failed to load report.
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <StatStrip
                items={[
                  {
                    label: "Employees",
                    value: reports.length,
                  },
                  {
                    label: "Completed requirements",
                    value: totals.completed,
                  },
                  {
                    label: "In progress",
                    value: totals.inProgress,
                  },
                  {
                    label: "Pending",
                    value: totals.pending,
                  },
                  {
                    label: "Total requirements",
                    value: totalRequirements,
                  },
                ]}
              />

              {reports.length === 0 ? (
                <div className="py-8 text-center text-ink/50">
                  No employees found for this department.
                </div>
              ) : (
                <Table>
                  <THead
                    columns={[
                      "Employee",
                      "Position",
                      "Department",
                      "Completed",
                      "In progress",
                      "Pending",
                      "Total",
                      "Status",
                    ]}
                  />

                  <tbody>
                    {reports.map((employee) => (
                      <TRow key={employee.employee}>
                        <TCell strong>{employee.employee}</TCell>

                        <TCell>{employee.position}</TCell>

                        <TCell>{formatDepartment(employee.department)}</TCell>

                        <TCell>{employee.completed}</TCell>

                        <TCell>{employee.inProgress}</TCell>

                        <TCell>{employee.pending}</TCell>

                        <TCell>{employee.total}</TCell>

                        <TCell>
                          <Badge
                            variant={
                              employee.onboardingStatus === "in_progress" ||
                              employee.onboardingStatus ===
                                "resubmission-required"
                                ? "pending"
                                : employee.onboardingStatus === "completed"
                                  ? "completed"
                                  : employee.onboardingStatus === "pending"
                                    ? "in-progress"
                                    : undefined
                            }
                          >
                            {employee.onboardingStatus === "in_progress"
                              ? "In Progress"
                              : employee.onboardingStatus ===
                                  "resubmission-required"
                                ? "Resubmission Required"
                                : employee.onboardingStatus}
                          </Badge>
                        </TCell>
                      </TRow>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
