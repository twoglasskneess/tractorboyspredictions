import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LocalTime from "@/components/LocalTime";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const fixtures = await prisma.fixture.findMany({
    orderBy: { match_date: "asc" }
  });

  const users = await prisma.user.findMany({
    select: { id: true, display_name: true, match_score_total: true, lineup_score_total: true }
  });

  const matchLeaderboard = [...users].sort((a, b) => b.match_score_total - a.match_score_total);
  const lineupLeaderboard = [...users].sort((a, b) => b.lineup_score_total - a.lineup_score_total);

  const upcomingFixtures = fixtures.filter(f => f.status !== "COMPLETED");
  const completedFixtures = fixtures.filter(f => f.status === "COMPLETED");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Fixtures */}
      <div className="lg:col-span-2 space-y-8">
        
        <section>
          <h2 className="text-2xl font-bold mb-4 text-[#0000FF] border-b-2 border-red-600 inline-block pb-1">Upcoming Fixtures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFixtures.map(fixture => {
              const isLocked = new Date() > new Date(fixture.lock_time);
              return (
                <Link key={fixture.id} href={`/dashboard/fixture/${fixture.id}`}>
                  <div className={`p-6 rounded shadow-md border-l-4 transition-transform hover:-translate-y-1 ${isLocked ? 'bg-gray-200 border-gray-500 cursor-not-allowed' : 'bg-white border-[#0000FF] hover:shadow-lg cursor-pointer'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold">ITFC vs {fixture.opponent_name}</h3>
                      {isLocked && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">LOCKED</span>}
                    </div>
                    <p className="text-sm text-red-600 font-semibold mt-1">Deadline: <LocalTime date={fixture.lock_time} /></p>
                  </div>
                </Link>
              );
            })}
            {upcomingFixtures.length === 0 && <p className="text-gray-500">No upcoming fixtures.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-[#0000FF] border-b-2 border-red-600 inline-block pb-1">Completed Fixtures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedFixtures.map(fixture => (
              <Link key={fixture.id} href={`/dashboard/fixture/${fixture.id}`}>
                <div className="p-6 bg-white rounded shadow-md border-l-4 border-green-500 hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer">
                  <h3 className="text-lg font-bold mb-2">ITFC vs {fixture.opponent_name}</h3>
                  <div className="flex items-center justify-center bg-gray-100 py-3 rounded mb-2">
                    <span className="text-2xl font-black">{fixture.actual_home_score} - {fixture.actual_away_score}</span>
                  </div>
                  <p className="text-sm text-gray-600 text-center">Played: <LocalTime date={fixture.match_date} format="date" /></p>
                </div>
              </Link>
            ))}
            {completedFixtures.length === 0 && <p className="text-gray-500">No completed fixtures yet.</p>}
          </div>
        </section>

      </div>

      {/* Right Column: Leaderboards */}
      <div className="space-y-8">
        
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-[#0000FF]">
          <h2 className="text-xl font-bold mb-4 text-center">Scoreline Predictor</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left pb-2">Rank</th>
                <th className="text-left pb-2">Player</th>
                <th className="text-right pb-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {matchLeaderboard.map((user, idx) => (
                <tr key={user.id} className={`border-b border-gray-100 ${user.id === session.user.id ? 'bg-blue-50 font-bold' : ''}`}>
                  <td className="py-2">{idx + 1}</td>
                  <td className="py-2">{user.display_name}</td>
                  <td className="py-2 text-right">{user.match_score_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded shadow-md border-t-4 border-red-600">
          <h2 className="text-xl font-bold mb-4 text-center">Starting XI</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left pb-2">Rank</th>
                <th className="text-left pb-2">Player</th>
                <th className="text-right pb-2">Pts</th>
              </tr>
            </thead>
            <tbody>
              {lineupLeaderboard.map((user, idx) => (
                <tr key={user.id} className={`border-b border-gray-100 ${user.id === session.user.id ? 'bg-red-50 font-bold' : ''}`}>
                  <td className="py-2">{idx + 1}</td>
                  <td className="py-2">{user.display_name}</td>
                  <td className="py-2 text-right">{user.lineup_score_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
