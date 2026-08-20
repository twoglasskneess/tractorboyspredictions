"use client";
import { signOut } from "next-auth/react";
export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-red-600 px-3 py-1 rounded text-white text-sm hover:bg-red-700 font-bold">
      Logout
    </button>
  );
}
