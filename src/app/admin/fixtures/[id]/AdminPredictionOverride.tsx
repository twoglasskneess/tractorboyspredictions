"use client";
import { useState, useTransition } from "react";
import Select from "react-select";
import { adminSubmitPrediction } from "../../actions";

export default function AdminPredictionOverride({ fixtureId, squad, users, existingPredictions }: any) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // Find if selected user has an existing prediction
  const existing = existingPredictions.find((p: any) => p.user_id === selectedUserId);
  const existingLineup = existing ? JSON.parse(existing.predicted_lineup) : [];

  const squadOptions = squad.map((s: any) => ({
    value: s.id,
    label: `${s.player_name} ${s.shirt_number ? `(No. ${s.shirt_number})` : ''} - ${s.position || 'Unknown'}`
  }));

  const userOptions = users.map((u: any) => ({
    value: u.id,
    label: `${u.display_name} (${u.username})`
  }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId) return alert("Select a user first");
    
    const formData = new FormData(e.currentTarget);
    formData.append("user_id", selectedUserId);
    
    startTransition(() => {
      adminSubmitPrediction(fixtureId, formData)
        .then(() => alert("Prediction saved successfully!"))
        .catch(err => alert(err.message));
    });
  };

  return (
    <div>
      <div className="mb-8">
        <label className="block font-bold mb-2">Select User to override/submit for:</label>
        <Select 
          options={userOptions}
          onChange={(opt: any) => setSelectedUserId(opt?.value || null)}
          isClearable
          placeholder="Search for a user..."
        />
      </div>

      {selectedUserId && (
        <form onSubmit={handleSubmit} className="border-t pt-6 border-gray-200">
          <h2 className="text-xl font-bold mb-4">Prediction for {users.find((u: any) => u.id === selectedUserId)?.display_name}</h2>
          
          <div className="flex gap-4 items-center justify-center bg-gray-50 p-4 rounded mb-6">
            <div className="text-center">
              <label className="block text-sm font-bold text-gray-500 mb-1">ITFC</label>
              <input type="number" name="predicted_home_score" defaultValue={existing?.predicted_home_score ?? 0} min="0" required className="border p-2 rounded w-16 text-center text-xl font-black" />
            </div>
            <div className="text-2xl font-black text-gray-400">VS</div>
            <div className="text-center">
              <label className="block text-sm font-bold text-gray-500 mb-1">Opponent</label>
              <input type="number" name="predicted_away_score" defaultValue={existing?.predicted_away_score ?? 0} min="0" required className="border p-2 rounded w-16 text-center text-xl font-black" />
            </div>
          </div>

          <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm text-center mb-4">Starting XI</h3>
          <div className="space-y-3 mb-6">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Player {i + 1}</label>
                <Select
                  name={`player_${i}`}
                  options={squadOptions}
                  defaultValue={squadOptions.find((opt: any) => opt.value === existingLineup[i])}
                  required
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={isPending} className="w-full bg-[#0000FF] text-white font-bold py-3 rounded hover:bg-blue-800 disabled:opacity-50">
            {isPending ? "Saving..." : "Save Override Prediction"}
          </button>
        </form>
      )}
    </div>
  );
}
