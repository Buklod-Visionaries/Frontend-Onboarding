import { useState } from "react";
import * as XLSX from "xlsx";
import { ClipboardList, Users } from "lucide-react";

import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { StatStrip } from "../../components/ui/StatCard";
import { Field, Select } from "../../components/ui/Field";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { DEPARTMENTS } from "../../domain/constants";
import { useApp } from "../../hooks/useApp";
import { formatDepartment, formatStatus } from "../../lib/formatter";
import { useReports } from "../../hooks/useReports";
import { formatDate, formatRelativeDate } from "../../domain/date";

export default function Reports() {
  const app = useApp();

  const [department, setDepartment] = useState(() => {
    return localStorage.getItem("reports_selected_department") || "All";
  });

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

  // const handleGenerate = () => {
  //   setGenerated(true);
  // };

  const handleExportExcel = () => {
    if (!reports.length) return;

    const excelData = reports.map((employee) => ({
      Employee: employee.employee,
      Position: employee.position,
      Department: formatDepartment(employee.department),
      "In Progress": employee.inProgress,
      Pending: employee.pending,
      Completed: employee.completed,
      Total: employee.total,
      "Start Date": formatDate(employee.startDate),
      "Completed Date": formatDate(employee.completedDate),
      Status:
        employee.onboardingStatus === "in_progress"
          ? "In Progress"
          : employee.onboardingStatus === "completed"
            ? "Completed"
            : "",
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
      {/* Phones: the filter and export share one row, export keeps its size. */}
      <div className="flex flex-wrap items-end gap-3 max-sm:flex-nowrap">
        <Field
          label="Department"
          className="min-w-0 flex-1 sm:min-w-[180px] sm:flex-none"
        >
          <Select
            value={department}
            options={[
              { value: "All", label: "All departments" },
              ...DEPARTMENTS,
            ]}
            onChange={(e) => {
              const selectedValue = e.target.value;
              setDepartment(selectedValue);
              //set value to localstorage
              localStorage.setItem(
                "reports_selected_department",
                selectedValue,
              );
            }}
          />
        </Field>

        {/* <Button variant="primary" onClick={handleGenerate} disabled={isLoading}>
          Generate Report
        </Button> */}

        {!isLoading && !isError && reports.length > 0 && (
          <Button variant="secondary" onClick={handleExportExcel}>
            Export Excel
          </Button>
        )}
      </div>

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
          <div className="py-8 text-center text-ink/50">Loading report...</div>
        )}

        {isError && (
          <div className="py-8 text-center text-red-800">
            Failed to load report.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <StatStrip
              min={130}
              items={[
                {
                  label: "Employees",
                  value: reports.length,
                  icon: Users,
                },
                {
                  label: "Completed requirements",
                  value: totals.completed,
                  tone: "success",
                },
                {
                  label: "In progress",
                  value: totals.inProgress,
                  tone: "warning",
                },
                {
                  label: "Pending",
                  value: totals.pending,
                  tone: "warning",
                },
                {
                  label: "Total requirements",
                  value: totalRequirements,
                  icon: ClipboardList,
                },
              ]}
            />

            {reports.length === 0 ? (
              <div className="py-8 text-center text-ink/50">
                No employees found for this department.
              </div>
            ) : (
              <>
                {/* A comparison table, so it stays a table: it scrolls sideways
                  inside the card with the Employee column pinned. */}
                <p className="m-0 text-meta text-ink/55 lg:hidden">
                  Scroll sideways to compare all columns.
                </p>
                <Table className="[&_tr>*:first-child]:sticky [&_tr>*:first-child]:left-0 [&_tr>*:first-child]:z-[1] [&_tr>*:first-child]:bg-neutral-100 [&_tr>*:first-child]:pl-1">
                  <THead
                    columns={[
                      "Employee",
                      "Position",
                      "Department",
                      "In progress",
                      "Pending",
                      "Completed",
                      "Total",
                      "Start Date",
                      "Completed Date",
                      "Status",
                    ]}
                  />

                  <tbody>
                    {reports.map((employee) => (
                      <TRow key={employee.employee}>
                        <TCell strong>{employee.employee}</TCell>

                        <TCell>{employee.position}</TCell>

                        <TCell>{formatDepartment(employee.department)}</TCell>

                        <TCell>{employee.inProgress}</TCell>

                        <TCell>{employee.pending}</TCell>

                        <TCell>{employee.completed}</TCell>

                        <TCell>{employee.total}</TCell>

                        <TCell>{formatDate(employee.startDate)}</TCell>

                        <TCell>{formatDate(employee.completedDate)}</TCell>

                        <TCell>
                          <Badge
                            variant={
                              employee.onboardingStatus === "in_progress"
                                ? "in-progress"
                                : employee.onboardingStatus === "completed"
                                  ? "completed"
                                  : employee.onboardingStatus === "deactivated"
                                    ? "deactivated"
                                    : undefined
                            }
                          >
                            {employee.onboardingStatus === "in_progress"
                              ? "In Progress"
                              : employee.onboardingStatus ===
                                  "resubmission-required"
                                ? "Resubmission Required"
                                : formatStatus(employee.onboardingStatus)}
                          </Badge>
                        </TCell>
                      </TRow>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
