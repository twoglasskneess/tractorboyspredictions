import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import PredictionForm from "./PredictionForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sortSquad } from "@/lib/utils";
import LocalTime from "@/components/LocalTime";

export default async function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const { id } = await params;

  const fixture = await prisma.fixture.findUnique({
    where: { id },
    include: {
      predictions: {
        include: { user: true }
      }
    }
  });

  if (!fixture) return notFound();

  const isLocked = new Date() > new Date(fixture.lock_time);
  
  const squadUnsorted = await prisma.squad.findMany({
    where: { is_active: true },
    select: { id: true, player_name: true, position: true, shirt_number: true }
  });
  
  const squad = sortSquad(squadUnsorted);

  const myPrediction = fixture.predictions.find(p => p.user_id === session.user.id);
  const existingPred = myPrediction ? {
    home: myPrediction.predicted_home_score,
    away: myPrediction.predicted_away_score,
    lineup: JSON.parse(myPrediction.predicted_lineup)
  } : null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="text-[#0000FF] hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="bg-white p-8 rounded shadow-md mb-8 text-center border-t-4 border-red-600">
        <h1 className="text-3xl font-black mb-2">ITFC vs {fixture.opponent_name}</h1>
        <p className="text-gray-600">Match Date: <LocalTime date={fixture.match_date} /></p>
        <p className="text-red-600 font-bold mt-2">
          {isLocked ? "Predictions are Locked" : <span>Deadline: <LocalTime date={fixture.lock_time} /></span>}
        </p>
      </div>

      {!isLocked ? (
        <PredictionForm fixtureId={fixture.id} squad={squad} existing={existingPred} />
      ) : (
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-[#0000FF]">
          <h2 className="text-2xl font-bold mb-4">All Predictions</h2>
          <div className="space-y-6">
            {fixture.predictions.map(p => {
              const pLineup = JSON.parse(p.predicted_lineup) as string[];
              const pLineupNames = pLineup.map(id => squad.find(sq => sq.id === id)?.player_name || "Unknown");
              return (
                <div key={p.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">{p.user.display_name}</span>
                    <span className="font-black text-xl">{p.predicted_home_score} - {p.predicted_away_score}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500">Predicted XI:</span>
                    <p className="text-sm">{pLineupNames.join(", ")}</p>
                  </div>
                </div>
              );
            })}
            {fixture.predictions.length === 0 && <p className="text-gray-500">No predictions were made for this fixture.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
