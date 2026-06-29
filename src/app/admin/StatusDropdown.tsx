"use client";

import React, { useState, useTransition } from "react";
import { updateLeadStatus } from "../actions/adminActions";
import { Loader2 } from "lucide-react";

interface StatusDropdownProps {
  recordId: string;
  currentStatus: string;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  recordId,
  currentStatus,
}) => {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    setStatus(nextStatus);
    setError("");

    startTransition(async () => {
      const res = await updateLeadStatus(recordId, nextStatus);
      if (!res.success) {
        setStatus(currentStatus); // Rollback on error
        setError(res.error || "Failed to update status.");
      }
    });
  };

  const getStatusColor = (val: string) => {
    switch (val) {
      case "active":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "contacted":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "waitlisted":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: // pending
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center">
        {isPending && (
          <Loader2 className="absolute -left-6 w-4.5 h-4.5 animate-spin text-electric-cyan" />
        )}
        <select
          value={status}
          onChange={handleChange}
          disabled={isPending}
          className={`appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-semibold border focus:outline-none focus:border-electric-cyan transition-all duration-300 ${getStatusColor(status)} pr-8 bg-transparent`}
        >
          {status === "pending" && <option value="pending" className="bg-[#0A0F1D] text-slate-400">Pending</option>}
          <option value="waitlisted" className="bg-[#0A0F1D] text-amber-400">Waitlisted</option>
          <option value="contacted" className="bg-[#0A0F1D] text-blue-400">Contacted</option>
          <option value="active" className="bg-[#0A0F1D] text-emerald-400">Active</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-[9px] text-red-400 font-semibold">{error}</span>}
    </div>
  );
};
