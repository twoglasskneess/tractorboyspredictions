import { prisma } from "@/lib/db";
import ResultEntryForm from "./ResultEntryForm";
import { sortSquad } from "@/lib/utils";
import LocalTime from "@/components/LocalTime";
import CreateFixtureForm from "./CreateFixtureForm";

export default async function AdminFixturesPage() {
  const fixtures = await prisma.fixture.findMany({
    orderBy: { match_date: "desc" },
    include: {
      predictions: {
        include: { user: true }
      }
    }
  });

  const activeSquadUnsorted = await prisma.squad.findMany({
    where: { is_active: true },
    select: { id: true, player_name: true, position: true, shirt_number: true }
  });
  
  const activeSquad = sortSquad(activeSquadUnsorted);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#0000FF]">Fixture Management</h1>
      
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Fixture</h2>
        <CreateFixtureForm />
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Fixtures</h2>
        <div className="space-y-6">
          {fixtures.map(fixture => (
            <div key={fixture.id} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">ITFC vs {fixture.opponent_name}</h3>
                  <p className="text-sm text-gray-600">Match Date: <LocalTime date={fixture.match_date} /></p>
                  <p className="text-sm text-gray-600">Lock Time: <LocalTime date={fixture.lock_time} /></p>
                  <p className="text-sm font-bold mt-1">Status: {fixture.status}</p>
                </div>
                {fixture.status === "COMPLETED" && (
                  <div className="text-right">
                    <p className="text-2xl font-bold">{fixture.actual_home_score} - {fixture.actual_away_score}</p>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-700 bg-blue-50 p-3 rounded">
                <strong>{fixture.predictions.length} Prediction{fixture.predictions.length !== 1 ? 's' : ''} submitted by: </strong>
                {fixture.predictions.length > 0 ? (
                  fixture.predictions.map(p => p.user.display_name).join(', ')
                ) : (
                  <span className="italic">No one yet</span>
                )}
              </div>
              <ResultEntryForm fixture={fixture} squad={activeSquad} />
            </div>
          ))}
          {fixtures.length === 0 && <p>No fixtures found.</p>}
        </div>
      </div>
    </div>
  );
}
