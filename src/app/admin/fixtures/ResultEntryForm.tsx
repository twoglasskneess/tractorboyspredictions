"use client";

import { useState } from "react";
import { submitFixtureResult } from "../actions";

import Select from "react-select";

type Player = { id: string; player_name: string; position: string | null; shirt_number: number | null };
type FixtureData = {
  id: string;
  actual_home_score: number | null;
  actual_away_score: number | null;
  actual_lineup: string | null;
  status: string;
};

export default function ResultEntryForm({ fixture, squad }: { fixture: FixtureData, squad: Player[] }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    fixture.actual_lineup ? JSON.parse(fixture.actual_lineup) : Array(11).fill("")
  );
  const [isEditing, setIsEditing] = useState(fixture.status !== "COMPLETED");

  if (!isEditing) {
    return (
      <div className="mt-4">
        <button onClick={() => setIsEditing(true)} className="bg-gray-200 text-sm px-3 py-1 rounded font-bold hover:bg-gray-300">
          Edit Result & Recalculate
        </button>
      </div>
    );
  }

  const handlePlayerSelect = (index: number, playerId: string) => {
    const newSelected = [...selectedPlayers];
    newSelected[index] = playerId;
    setSelectedPlayers(newSelected);
  };

  const getAvailablePlayers = (currentIndex: number) => {
    return squad.filter(
      p => !selectedPlayers.includes(p.id) || selectedPlayers[currentIndex] === p.id
    );
  };

  const formatOption = (p: Player) => {
    return `${p.shirt_number ? `${p.shirt_number} - ` : ''}${p.player_name} ${p.position ? `(${p.position})` : ''}`;
  };

  const allOptions = squad.map(p => ({
    value: p.id,
    label: formatOption(p)
  }));

  return (
    <form action={submitFixtureResult.bind(null, fixture.id)} className="mt-4 p-4 border rounded bg-gray-50">
      <h4 className="font-bold mb-2">{fixture.status === "COMPLETED" ? "Edit Match Results" : "Enter Match Results"}</h4>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold mb-1">ITFC Score</label>
          <input type="number" name="actual_home_score" defaultValue={fixture.actual_home_score ?? ""} required className="border p-2 rounded w-20" min="0" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Opponent Score</label>
          <input type="number" name="actual_away_score" defaultValue={fixture.actual_away_score ?? ""} required className="border p-2 rounded w-20" min="0" />
        </div>
      </div>
      <h4 className="font-bold mb-2">Starting XI</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i}>
            <Select
              instanceId={`admin_player_select_${i}`}
              options={getAvailablePlayers(i).map(p => ({ value: p.id, label: formatOption(p) }))}
              value={allOptions.find(o => o.value === selectedPlayers[i]) || null}
              onChange={(option) => handlePlayerSelect(i, option?.value || "")}
              isClearable
              placeholder={`Select Player ${i + 1}`}
              className="text-sm"
            />
            <input type="hidden" name={`player_${i}`} value={selectedPlayers[i]} required />
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">
          {fixture.status === "COMPLETED" ? "Update Results & Recalculate" : "Submit Results & Calculate"}
        </button>
        {fixture.status === "COMPLETED" && (
          <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded font-bold hover:bg-gray-500">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
