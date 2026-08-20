import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-[#0000FF] text-white p-4 shadow-md flex justify-between items-center">
        <div className="font-bold text-xl flex items-center gap-2">
          <span>ITFC</span>
          <span className="hidden sm:inline">Predictor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">Welcome, {session?.user?.display_name}</span>
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="bg-white text-[#0000FF] px-3 py-1 rounded text-sm font-bold hover:bg-gray-200">Admin Panel</Link>
          )}
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
