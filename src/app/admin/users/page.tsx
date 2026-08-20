import { prisma } from "@/lib/db";
import { createUser, resetPassword } from "../actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { username: "asc" }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[#0000FF]">User Management</h1>
      
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Create New User</h2>
        <form action={createUser} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-bold mb-1">Username</label>
            <input type="text" name="username" required className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Display Name</label>
            <input type="text" name="display_name" required className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input type="password" name="password" required className="border p-2 rounded" />
          </div>
          <button type="submit" className="bg-[#0000FF] text-white px-4 py-2 rounded font-bold hover:bg-blue-800">
            Create User
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Existing Users</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Username</th>
              <th className="border p-2 text-left">Display Name</th>
              <th className="border p-2 text-left">Role</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.display_name}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">
                  <form action={resetPassword.bind(null, user.id)} className="flex gap-2">
                    <input type="password" name="password" placeholder="New Password" required className="border p-1 rounded text-sm" />
                    <button type="submit" className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold hover:bg-red-700">
                      Reset Password
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
