import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import StatCard from "../../components/ui/StatCard";
import AutoGrid from "../../components/ui/AutoGrid";
import { EmptyState } from "../../components/ui/Notice";
import { TCell, THead, TRow, Table } from "../../components/ui/Table";
import ConfirmActivityDialog from "../../components/feature/requirements/ConfirmActivityDialog";
import { useDepartmentScope } from "../../hooks/useDepartmentScope";
import { formatDate } from "../../domain/date";
//
import { useApp } from "../../hooks/useApp";
import api from "../../lib/axios";

export default function DeptDashboard() {
  const app = useApp();
  const navigate = useNavigate();
  const scope = useDepartmentScope();
  const [confirm, setConfirm] = useState(null);
  const [user, setUser] = useState([]);
  const [depEmployees, setDepEmployees] = useState([]);
  const [depRequirements, setDepRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const pending = depRequirements.filter((row) => row.status !== "completed");
  const done = (key) =>
    scope.employees.filter((employee) => employee.milestones[key]).length;

  //
  // async function confirmRequirement(id) {
  //   try {
  //     setConfirmLoading(true);
  //     const res = await api.put(
  //       `/employee-requirements/${id}`,
  //       { status: "completed" },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${app.session.accessToken}`,
  //         },
  //       },
  //     );
  //     setDepRequirements((prevDepReq) =>
  //       prevDepReq.map((req) =>
  //         req._id === id ? { ...req, status: res.data.status } : req,
  //       ),
  //     );
  //     alert("success");
  //   } catch (error) {
  //     console.log(error.response.data.message);
  //   } finally {
  //     setConfirmLoading(false);
  //   }
  // }

  useEffect(() => {
    async function getCurrentUser() {
      try {
        setLoading(true);
        const res = await api.get("/users/me", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }

    async function getDepEmployees() {
      try {
        const res = await api.get("/employees/department", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setDepEmployees(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      }
    }

    async function getDepEmpReq() {
      try {
        const res = await api.get("/employee-requirements/department", {
          headers: {
            Authorization: `Bearer ${app.session.accessToken}`,
          },
        });
        setDepRequirements(res.data);
      } catch (error) {
        console.log(error.response.data.message);
      }
    }

    getCurrentUser();
    getDepEmployees();
    getDepEmpReq();
  }, []);

  console.log("depEmployees", depRequirements);

  return (
    <>
      <AutoGrid min={190} gap="gap-4">
        <StatCard
          label="Employees in department"
          value={depEmployees.length}
          note={scope.department}
        />
        <StatCard
          label="Pending confirmations"
          value={pending.length}
          note="Activities awaiting you"
        />
        <StatCard
          label="Orientation done"
          value={`${depRequirements.filter((e) => e.requirement.activity === "orientation" && e.status === "completed").length}/${depRequirements.filter((e) => e.requirement.activity === "orientation").length}`}
          note="Company orientation"
        />
        <StatCard
          label="Training done"
          value={`${done("training")}/${depRequirements.filter((e) => e.requirement.activity === "dept-training").length}`}
          note="One-month training"
        />
      </AutoGrid>

      <Card className="gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-[20px]">Activities awaiting your confirmation</h4>
          <Button
            className="ml-auto"
            onClick={() => navigate("/dept/requirements")}
          >
            Department requirements
          </Button>
        </div>

        {depEmployees.length ? (
          <Table>
            <THead
              columns={[
                "Employee",
                "Position",
                "Activity",
                "Target date",
                "Status",
                { label: "", align: "right" },
              ]}
            />
            <tbody>
              {confirmLoading ? "Loading..." : (depRequirements.map((req) => (
                <TRow key={req._id}>
                  <TCell strong>{req.employee.user.username}</TCell>
                  <TCell>{req.employee.position}</TCell>
                  <TCell>{req.requirement.name}</TCell>
                  <TCell>{formatDate(req.dueDate)}</TCell>
                  <TCell>
                    <Badge>{req.status}</Badge>
                  </TCell>
                  <TCell align="right">
                    {req.status !== "completed" && (
                      <Button variant="primary" onClick={() => setConfirm(req)}>
                        Confirm
                      </Button>
                    )}
                  </TCell>
                </TRow>
              )))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            Nothing is waiting for confirmation in {scope.department}.
          </EmptyState>
        )}
      </Card>

      <ConfirmActivityDialog
        target={confirm}
        setConfirmLoading={setConfirmLoading}
        setDepRequirements={setDepRequirements}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
