"use client";
import { useTransition } from "react";
import { deleteUser } from "../actions";

export default function DeleteUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Are you sure you want to completely delete this user and all their predictions?")) {
      startTransition(() => {
        deleteUser(userId).catch(err => alert(err.message));
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold hover:bg-red-700 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
