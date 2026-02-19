"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="p-6">
      <div className="card p-8 max-w-lg">
        <h1 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4 break-words">{error.message}</p>
        <div className="flex gap-3">
          <button onClick={() => reset()} className="btn-primary">
            Try again
          </button>
          <a href="/dashboard" className="btn-secondary">
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
