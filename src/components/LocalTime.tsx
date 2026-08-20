"use client";
import { useEffect, useState } from "react";

export default function LocalTime({ date, format = "datetime" }: { date: Date | string, format?: "datetime" | "date" }) {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    const d = new Date(date);
    if (format === "date") {
      setFormatted(d.toLocaleDateString(undefined, { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      }));
    } else {
      setFormatted(d.toLocaleString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }));
    }
  }, [date, format]);

  if (formatted === null) {
    return <span className="opacity-0">Loading...</span>; // Prevents hydration mismatch
  }

  return <span>{formatted}</span>;
}
