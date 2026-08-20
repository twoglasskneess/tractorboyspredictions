"use client";
import { useState } from "react";
import { editPlayer, togglePlayerActive } from "../actions";

type Player = {
  id: string;
  player_name: string;
  position: string | null;
  shirt_number: number | null;
  is_active: boolean;
};

export default function PlayerRow({ player }: { player: Player }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="border-b bg-gray-50">
        <td colSpan={5} className="p-2 border">
          <form 
            action={async (formData) => {
              await editPlayer(player.id, formData);
              setIsEditing(false);
            }} 
            className="flex gap-4 items-center flex-wrap"
          >
            <input type="number" name="shirt_number" defaultValue={player.shirt_number || ""} className="border p-1 rounded w-16" placeholder="No." />
            <input type="text" name="player_name" defaultValue={player.player_name} required className="border p-1 rounded w-48" placeholder="Name" />
            <select name="position" defaultValue={player.position || ""} className="border p-1 rounded w-24">
              <option value="">Any</option>
              <option value="GK">GK</option>
              <option value="DEF">DEF</option>
              <option value="MID">MID</option>
              <option value="FW">FW</option>
            </select>
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-bold">Save</button>
            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500 font-bold">Cancel</button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="border p-2 font-bold">{player.shirt_number || "-"}</td>
      <td className="border p-2">{player.player_name}</td>
      <td className="border p-2">{player.position || "-"}</td>
      <td className="border p-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${player.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {player.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="border p-2 flex gap-2">
        <button onClick={() => setIsEditing(true)} className="bg-blue-100 text-[#0000FF] border border-[#0000FF] px-3 py-1 rounded text-sm hover:bg-blue-200 font-bold">
          Edit
        </button>
        <form action={togglePlayerActive.bind(null, player.id, player.is_active)}>
          <button type="submit" className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 font-bold">
            Toggle Status
          </button>
        </form>
      </td>
    </tr>
  );
}
