import React from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="container-FitnTry py-24">
      <EmptyState
        icon={<Compass className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />}
        title="This page wandered off"
        description="The page you're looking for doesn't exist. Let's get you back to the dressing room."
        actionLabel="Go to Try On"
        onAction={() => navigate("/try-on")}
      />
    </div>
  );
}
