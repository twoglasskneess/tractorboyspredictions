import { prisma } from "@/lib/db";
import { createPlayer } from "../actions";
import PlayerRow from "./PlayerRow";

export default async function AdminSquadPage() {
  const squadUnsorted = await prisma.squad.findMany();
  
  // Sort in number order, nulls at the end
  const squad = squadUnsorted.sort((a, b) => {
    const numA = a.shirt_number ?? 999;
    const numB = b.shirt_number ?? 999;
    if (numA !== numB) return numA - numB;
    return a.player_name.localeCompare(b.player_name);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#0000FF]">Squad Management</h1>
      
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Add Player to Squad</h2>
        <form action={createPlayer} className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-bold mb-1">Player Name</label>
            <input type="text" name="player_name" required className="border p-2 rounded w-48" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Shirt Number</label>
            <input type="number" name="shirt_number" className="border p-2 rounded w-24" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Position</label>
            <select name="position" className="border p-2 rounded w-32">
              <option value="">Any</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="MID">MID</option>
              <option value="FW">FW</option>
            </select>
          </div>
          <button type="submit" className="bg-[#0000FF] text-white px-4 py-2 rounded font-bold hover:bg-blue-800">
            Add Player
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Current Squad</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">No.</th>
              <th className="border p-2 text-left">Player Name</th>
              <th className="border p-2 text-left">Position</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {squad.map(player => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
