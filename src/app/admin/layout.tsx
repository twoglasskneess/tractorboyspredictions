import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#0000FF] text-white p-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-xl flex items-center gap-2">
          {/* Use ITFC logo placeholder if you have one, or just text */}
          <span>Admin Panel - Tractor Boys Predictor</span>
        </div>
        <div className="space-x-6 flex items-center">
          <Link href="/admin/users" className="hover:text-red-400 font-semibold transition-colors">Users</Link>
          <Link href="/admin/squad" className="hover:text-red-400 font-semibold transition-colors">Squad</Link>
          <Link href="/admin/fixtures" className="hover:text-red-400 font-semibold transition-colors">Fixtures</Link>
          <Link href="/dashboard" className="hover:text-red-400 font-semibold transition-colors">App Home</Link>
          <LogoutButton />
        </div>
      </nav>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
