import { prisma } from "@/lib/db";
import { sortSquad } from "@/lib/utils";
import AdminPredictionOverride from "./AdminPredictionOverride";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminFixtureOverridePage({ params }: { params: { id: string } }) {
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

  const activeSquadUnsorted = await prisma.squad.findMany({
    where: { is_active: true }
  });
  const squad = sortSquad(activeSquadUnsorted);

  const allUsers = await prisma.user.findMany({
    orderBy: { display_name: "asc" }
  });

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/fixtures" className="text-[#0000FF] font-bold hover:underline">
          &larr; Back to Fixtures
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Override Prediction: ITFC vs {fixture.opponent_name}</h1>
      
      <div className="bg-white p-6 rounded shadow-md">
        <AdminPredictionOverride 
          fixtureId={fixture.id} 
          squad={squad} 
          users={allUsers}
          existingPredictions={fixture.predictions}
        />
      </div>
    </div>
  );
}
