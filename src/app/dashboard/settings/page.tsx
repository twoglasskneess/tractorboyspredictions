import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic uppercase">Account Settings</h1>
        <Link href="/dashboard" className="text-[#0000FF] font-bold hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <ChangePasswordForm />
    </div>
  );
}
