import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import { Input, Segmented } from "../../components/ui/Field";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import { EmptyState } from "../../components/ui/Notice";
import { useApp } from "../../hooks/useApp";
import { countRequirements } from "../../domain/requirements";
import { employeeStatus } from "../../domain/employees";
import { formatDate } from "../../domain/date";
import { DEPARTMENTS } from "../../domain/constants";
//
import api from "../../lib/axios";
import { capitalize } from "../../lib/capitalize";

export default function EmployeeList() {
  const app = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [employees, setEmployees] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);

  async function getAllEmployees() {
    try {
      setEmpLoading(true);
      const res = await api.get("/employees", {
        headers: {
          Authorization: `Bearer ${app.session.accessToken}`,
        },
      });
      setEmployees(res.data);
    } catch (error) {
      console.log(error.response.data.message);
    } finally {
      setEmpLoading(false);
    }
  }

  async function getAllRequirements() {
    try {
      setReqLoading(true);
      const res = await api.get("/employee-requirements", {
        headers: {
          Authorization: `Bearer ${app.session.accessToken}`,
        },
      });
      setRequirements(res.data);
    } catch (error) {
    } finally {
      setReqLoading(false);
    }
  }

  console.log(employees);

  const query = search.trim().toLowerCase();
  const rows = employees.filter((employee) => {
    const byDepartment =
      department === "All" || employee.department === department;
    const byQuery =
      !query ||
      employee.name.toLowerCase().includes(query) ||
      employee.position.toLowerCase().includes(query);
    return byDepartment && byQuery;
  });

  useEffect(() => {
    getAllEmployees();
    getAllRequirements();
  }, []);

  if (empLoading || reqLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Card className="gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-[280px]"
          placeholder="Search employee or position"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Segmented
          value={department}
          onChange={setDepartment}
          options={["All", ...DEPARTMENTS]}
        />
        <Button
          variant="primary"
          className="ml-auto"
          onClick={() => navigate("/hr/employees/new")}
        >
          Add employee
        </Button>
      </div>

      {rows.length ? (
        <Table>
          <THead
            columns={[
              "Employee",
              "Position",
              "Department",
              "Start date",
              "Progress",
              "Status",
              { label: "", align: "right" },
            ]}
          />
          <tbody>
            {rows.map((employee) => {
              // const counts = countRequirements(employee);
              return (
                <TRow key={employee._id}>
                  <TCell strong>{employee.user.username}</TCell>
                  <TCell>{capitalize(employee.position)}</TCell>
                  <TCell>{capitalize(employee.department)}</TCell>
                  <TCell>{formatDate(employee.user.createdAt)}</TCell>
                  <TCell className="min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <ProgressBar
                        height="sm"
                        value={
                          (requirements.filter(
                            (req) =>
                              req.employee._id === employee._id &&
                              req.status === "completed",
                          ).length /
                            requirements.filter(
                              (req) => req.employee._id === employee._id,
                            ).length) *
                          100
                        }
                        className="min-w-[80px] flex-1"
                      />
                      <span className="text-meta tabular-nums text-ink/60">
                        {
                          requirements.filter(
                            (req) =>
                              req.employee._id === employee._id &&
                              req.status === "completed",
                          ).length
                        }
                        /
                        {
                          requirements.filter(
                            (req) => req.employee._id === employee._id,
                          ).length
                        }
                      </span>
                    </div>
                  </TCell>
                  <TCell>
                    <Badge
                      variant={
                        employee.onboardingStatus === "in_progress"
                          ? "pending"
                          : "completed"
                      }
                    >
                      {employee.onboardingStatus === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                    </Badge>
                  </TCell>
                  <TCell align="right">
                    <Button
                      onClick={() => navigate(`/hr/employees/${employee._id}`)}
                    >
                      Open
                    </Button>
                  </TCell>
                </TRow>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <EmptyState>No employees match this search.</EmptyState>
      )}

      <span className="text-meta text-ink/50">
        Showing {rows.length} of {employees.length} employee records
      </span>
    </Card>
  );
}
