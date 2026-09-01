"use client";

import { useTransition, useState } from "react";
import { editFixture, deleteFixture } from "../actions";

function toLocalISOString(dateString: string | Date) {
  const d = new Date(dateString);
  const tzOffset = d.getTimezoneOffset() * 60000; 
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function EditFixtureForm({ fixture }: { fixture: any }) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-block bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold px-2 py-1 rounded hover:bg-gray-200 ml-2"
      >
        Edit Fixture Details
      </button>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    const matchDateStr = (form.elements.namedItem("match_date") as HTMLInputElement).value;
    const lockTimeStr = (form.elements.namedItem("lock_time") as HTMLInputElement).value;
    const opponentName = (form.elements.namedItem("opponent_name") as HTMLInputElement).value;

    const formData = new FormData();
    formData.append("opponent_name", opponentName);
    formData.append("match_date", new Date(matchDateStr).toISOString());
    formData.append("lock_time", new Date(lockTimeStr).toISOString());

    startTransition(() => {
      editFixture(fixture.id, formData).then(() => {
        setIsOpen(false);
      });
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to completely delete this fixture? All associated predictions will also be deleted!")) {
      startTransition(() => {
        deleteFixture(fixture.id).then(() => setIsOpen(false));
      });
    }
  };

  return (
    <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">Edit Fixture</h4>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black font-bold">&times;</button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-bold mb-1">Opponent Name</label>
          <input type="text" name="opponent_name" defaultValue={fixture.opponent_name} required className="border p-2 rounded text-sm w-48" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Match Date & Time</label>
          <input type="datetime-local" name="match_date" defaultValue={toLocalISOString(fixture.match_date)} required className="border p-2 rounded text-sm w-48" />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1">Lock Time</label>
          <input type="datetime-local" name="lock_time" defaultValue={toLocalISOString(fixture.lock_time)} required className="border p-2 rounded text-sm w-48" />
        </div>
        <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={handleDelete} disabled={isPending} className="bg-red-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50">
          Delete Fixture
        </button>
      </form>
    </div>
  );
}
