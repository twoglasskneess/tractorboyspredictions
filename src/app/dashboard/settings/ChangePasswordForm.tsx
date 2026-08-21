"use client";
import { useState, useTransition } from "react";
import { changeMyPassword } from "./actions";

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      setMessage("");
      setError("");
      changeMyPassword(formData)
        .then((res) => {
          if (res.error) {
            setError(res.error);
          } else {
            setMessage("Password changed successfully!");
            (e.target as HTMLFormElement).reset();
          }
        })
        .catch(() => setError("An unexpected error occurred"));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      {message && <div className="bg-green-100 text-green-800 p-2 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{error}</div>}
      
      <div className="mb-4">
        <label className="block font-bold mb-1">Current Password</label>
        <input type="password" name="current_password" required className="w-full border p-2 rounded" />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-1">New Password</label>
        <input type="password" name="new_password" required className="w-full border p-2 rounded" minLength={6} />
      </div>
      
      <button type="submit" disabled={isPending} className="bg-blue-600 text-white font-bold px-4 py-2 rounded w-full hover:bg-blue-700 disabled:opacity-50">
        {isPending ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
