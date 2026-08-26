import { useState } from "react";
import useSWR from "swr";
import { toast } from "react-toastify";
import {
	TrashIcon,
	ArrowPathIcon,
	ShieldCheckIcon,
	UserIcon,
} from "@heroicons/react/24/outline";

import { useSession } from "../context/session";
import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";
import ErrorScreen from "../components/errorScreen";

const fetcher = (url) =>
	fetch(url, { credentials: "include" }).then((res) => {
		if (!res.ok) throw new Error("Failed to load");
		return res.json();
	});

export default function Users() {
	const { session } = useSession();
	const { data, isLoading, error, mutate } = useSWR("/api/admin/users", fetcher);
	const [showCreate, setShowCreate] = useState(false);
	const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
	const [resetId, setResetId] = useState(null);
	const [resetPassword, setResetPassword] = useState("");

	if (error) return <ErrorScreen />;
	if (isLoading) return <LoadingScreenNoThanks />;

	const users = data?.users || [];

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/admin/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(newUser),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || "Failed to create user");
			toast.success(`User "${newUser.username}" created`);
			setNewUser({ username: "", password: "", role: "user" });
			setShowCreate(false);
			mutate();
		} catch (err) {
			toast.error(err.message);
		}
	};

	const handleDelete = async (id, username) => {
		if (!confirm(`Delete user "${username}"? Their links will be unlinked but preserved.`))
			return;
		try {
			const res = await fetch(`/api/admin/users/${id}`, {
				method: "DELETE",
				credentials: "include",
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || "Failed to delete");
			toast.success(`User "${username}" deleted`);
			mutate();
		} catch (err) {
			toast.error(err.message);
		}
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		try {
			const res = await fetch(`/api/admin/users/${resetId}/password`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ password: resetPassword }),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || "Failed to reset password");
			toast.success("Password reset");
			setResetId(null);
			setResetPassword("");
		} catch (err) {
			toast.error(err.message);
		}
	};

	const handleRoleChange = async (id, role) => {
		try {
			const res = await fetch(`/api/admin/users/${id}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ role }),
			});
			const result = await res.json();
			if (!res.ok) throw new Error(result.message || "Failed to change role");
			toast.success(`Role changed to ${role}`);
			mutate();
		} catch (err) {
			toast.error(err.message);
		}
	};

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-lg font-semibold tracking-tight">User Management</h1>
				<button
					onClick={() => setShowCreate(!showCreate)}
					className="btn btn-primary !px-3.5 !py-1.5 text-sm"
				>
					{showCreate ? "Cancel" : "New User"}
				</button>
			</div>

			{/* Create user form */}
			{showCreate && (
				<form
					onSubmit={handleCreate}
					className="mb-6 rounded-xl bg-surface hairline p-5"
				>
					<h2 className="text-sm font-semibold text-ink mb-4">Create New User</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<input
							type="text"
							placeholder="Username"
							value={newUser.username}
							onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
							className="input"
							required
						/>
						<input
							type="password"
							placeholder="Password (min 8 chars)"
							value={newUser.password}
							onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
							className="input"
							required
						/>
						<select
							value={newUser.role}
							onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
							className="input"
						>
							<option value="user">User</option>
							<option value="superadmin">Superadmin</option>
						</select>
					</div>
					<button type="submit" className="btn btn-primary mt-3 text-sm">
						Create User
					</button>
				</form>
			)}

			{/* Reset password modal */}
			{resetId !== null && (
				<form
					onSubmit={handleResetPassword}
					className="mb-6 rounded-xl bg-surface hairline p-5"
				>
					<h2 className="text-sm font-semibold text-ink mb-4">Reset Password</h2>
					<input
						type="password"
						placeholder="New password (min 8 chars)"
						value={resetPassword}
						onChange={(e) => setResetPassword(e.target.value)}
						className="input mb-3"
						required
					/>
					<div className="flex gap-2">
						<button type="submit" className="btn btn-primary text-sm">
							Reset
						</button>
						<button
							type="button"
							onClick={() => {
								setResetId(null);
								setResetPassword("");
							}}
							className="btn btn-ghost text-sm"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{/* Users table */}
			<div className="rounded-xl bg-surface hairline overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="hairline-b">
							<th className="px-4 py-3 text-left font-medium text-mute">User</th>
							<th className="px-4 py-3 text-left font-medium text-mute">Role</th>
							<th className="px-4 py-3 text-left font-medium text-mute">Links</th>
							<th className="px-4 py-3 text-left font-medium text-mute">Created</th>
							<th className="px-4 py-3 text-right font-medium text-mute">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((u) => (
							<tr key={u.id} className="hairline-b last:border-0">
								<td className="px-4 py-3 text-ink font-medium">{u.username}</td>
								<td className="px-4 py-3">
									{u.role === "superadmin" ? (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-accent-dim px-2.5 py-0.5 text-xs font-medium text-accent">
											<ShieldCheckIcon className="h-3.5 w-3.5" />
											Superadmin
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-0.5 text-xs font-medium text-dim">
											<UserIcon className="h-3.5 w-3.5" />
											User
										</span>
									)}
								</td>
								<td className="px-4 py-3 text-dim">{u._count?.codes ?? 0}</td>
								<td className="px-4 py-3 text-mute">
									{new Date(u.createdAt).toLocaleDateString()}
								</td>
								<td className="px-4 py-3">
									<div className="flex items-center justify-end gap-1.5">
										<select
											value={u.role}
											onChange={(e) => handleRoleChange(u.id, e.target.value)}
											disabled={u.id === session.userId}
											className="input !py-1 !px-2 text-xs w-auto"
											title={u.id === session.userId ? "Cannot change your own role" : ""}
										>
											<option value="user">User</option>
											<option value="superadmin">Superadmin</option>
										</select>
										<button
											onClick={() => setResetId(u.id)}
											className="btn btn-ghost !p-1.5"
											title="Reset password"
										>
											<ArrowPathIcon className="h-4 w-4 text-dim" />
										</button>
										<button
											onClick={() => handleDelete(u.id, u.username)}
											disabled={u.id === session.userId}
											className="btn btn-ghost !p-1.5 disabled:opacity-30"
											title={u.id === session.userId ? "Cannot delete yourself" : "Delete user"}
										>
											<TrashIcon className="h-4 w-4 text-dim" />
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}