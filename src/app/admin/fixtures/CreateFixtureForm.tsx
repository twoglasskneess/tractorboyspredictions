"use client";

import { useTransition } from "react";
import { createFixture } from "../actions";

export default function CreateFixtureForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // We convert the datetime-local values (which lack timezone info)
    // into absolute ISO strings using the user's local browser timezone.
    const matchDateStr = (form.elements.namedItem("match_date") as HTMLInputElement).value;
    const lockTimeStr = (form.elements.namedItem("lock_time") as HTMLInputElement).value;
    const opponentName = (form.elements.namedItem("opponent_name") as HTMLInputElement).value;

    const formData = new FormData();
    formData.append("opponent_name", opponentName);
    formData.append("match_date", new Date(matchDateStr).toISOString());
    formData.append("lock_time", new Date(lockTimeStr).toISOString());

    startTransition(() => {
      createFixture(formData).then(() => {
        form.reset();
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
      <div>
        <label className="block text-sm font-bold mb-1">Opponent Name</label>
        <input type="text" name="opponent_name" required className="border p-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Match Date & Time</label>
        <input type="datetime-local" name="match_date" required className="border p-2 rounded" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1">Lock Time (Deadline)</label>
        <input type="datetime-local" name="lock_time" required className="border p-2 rounded" />
      </div>
      <button type="submit" disabled={isPending} className="bg-[#0000FF] text-white px-4 py-2 rounded font-bold hover:bg-blue-800 disabled:opacity-50">
        {isPending ? "Creating..." : "Create Fixture"}
      </button>
    </form>
  );
}
