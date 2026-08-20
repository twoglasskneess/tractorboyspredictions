"use client";
import { useState, useTransition } from "react";
import { submitPrediction } from "../actions";

type Player = { id: string; player_name: string; position: string | null; shirt_number: number | null };
type ExistingPred = { home: number; away: number; lineup: string[] } | null;

export default function PredictionForm({ 
  fixtureId, 
  squad, 
  existing 
}: { 
  fixtureId: string, 
  squad: Player[],
  existing: ExistingPred
}) {
  const [homeScore, setHomeScore] = useState<number | string>(existing?.home ?? "");
  const [awayScore, setAwayScore] = useState<number | string>(existing?.away ?? "");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(
    existing?.lineup ?? Array(11).fill("")
  );
  const [isPending, startTransition] = useTransition();

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      submitPrediction(fixtureId, formData).catch(err => alert(err.message));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md border-t-4 border-[#0000FF]">
      <h2 className="text-xl font-bold mb-4">Make Your Prediction</h2>
      
      <div className="flex gap-8 mb-8 items-center justify-center bg-gray-50 p-4 rounded">
        <div className="text-center">
          <label className="block font-bold mb-2">ITFC</label>
          <input 
            type="number" 
            name="predicted_home_score" 
            className="border p-2 rounded w-20 text-center text-xl font-bold" 
            min="0"
            value={homeScore}
            onChange={e => setHomeScore(e.target.value)}
            required 
          />
        </div>
        <div className="text-xl font-black text-gray-400">VS</div>
        <div className="text-center">
          <label className="block font-bold mb-2">Opponent</label>
          <input 
            type="number" 
            name="predicted_away_score" 
            className="border p-2 rounded w-20 text-center text-xl font-bold" 
            min="0"
            value={awayScore}
            onChange={e => setAwayScore(e.target.value)}
            required 
          />
        </div>
      </div>

      <h3 className="font-bold mb-4 text-center">Starting XI</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Player {i + 1}</label>
            <select 
              name={`player_${i}`}
              required
              className="border p-2 rounded w-full"
              value={selectedPlayers[i]}
              onChange={(e) => handlePlayerSelect(i, e.target.value)}
            >
              <option value="">Select Player</option>
              {getAvailablePlayers(i).map(p => (
                <option key={p.id} value={p.id}>
                  {p.shirt_number ? `${p.shirt_number} - ` : ''}{p.player_name} {p.position ? `(${p.position})` : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-[#0000FF] text-white p-3 rounded font-bold hover:bg-blue-800 disabled:opacity-50"
      >
        {isPending ? "Saving..." : existing ? "Update Prediction" : "Submit Prediction"}
      </button>
    </form>
  );
}
