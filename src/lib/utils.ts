export type Player = { 
  id: string; 
  player_name: string; 
  position: string | null; 
  shirt_number: number | null 
};

const positionOrder: Record<string, number> = { 
  "GK": 1, 
  "DEF": 2, 
  "MID": 3, 
  "FW": 4 
};

export function sortSquad(squad: Player[]) {
  return [...squad].sort((a, b) => {
    const posA = positionOrder[a.position || ""] || 99;
    const posB = positionOrder[b.position || ""] || 99;
    
    if (posA !== posB) return posA - posB;
    
    const numA = a.shirt_number || 999;
    const numB = b.shirt_number || 999;
    return numA - numB;
  });
}
