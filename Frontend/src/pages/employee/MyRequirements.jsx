import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import AutoGrid from "../../components/ui/AutoGrid";
import { Segmented } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/Notice";
import RequirementCard from "../../components/feature/requirements/RequirementCard";
import { useCurrentEmployee } from "../../hooks/useCurrentEmployee";
import { STATUSES } from "../../domain/constants";
//
import { useApp } from "../../hooks/useApp";
import api from "../../lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useMyRequirements } from "../../hooks/useRequirements";

const FILTERS = ["All", ...STATUSES];

export default function MyRequirements() {
  const app = useApp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const me = useCurrentEmployee();
  const {
    data: myRequirements = [],
    isLoading: myRequirementsLoading,
    isError: myRequirementsError,
  } = useMyRequirements(app.session.accessToken);

  const rows = myRequirements.filter(
    (requirement) => filter === "All" || requirement.status === filter,
  );

  if (myRequirementsLoading) {
    return <p>Loading...</p>;
  }

  if (myRequirementsError) {
    return <p>Failed loading requirements.</p>;
  }

  return (
    <Card className="gap-4">
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "All", label: "All" },
          { value: "in-progress", label: "In Progress" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
          { value: "resubmission-required", label: "Resubmission Required" },
        ]}
      />
      {rows.length ? (
        <AutoGrid min={280} gap="gap-4">
          {rows.map((requirement) => (
            <RequirementCard
              key={requirement._id}
              requirement={requirement}
              onOpen={() => {
                navigate(`/employee/requirements/${requirement._id}`);
              }}
            />
          ))}
        </AutoGrid>
      ) : (
        <EmptyState>No requirements with this status.</EmptyState>
      )}
    </Card>
  );
}
