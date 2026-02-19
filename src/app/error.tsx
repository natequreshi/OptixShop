"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="card p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => reset()}
          className="btn-primary w-full"
        >
          Try again
        </button>
        <a href="/login" className="block mt-3 text-sm text-primary-600 hover:underline">
          Back to login
        </a>
      </div>
    </div>
  );
}
