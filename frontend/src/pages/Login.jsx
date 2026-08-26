import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useSession } from "../context/session";
import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";

export default function Login() {
	const router = useNavigate();
	const { session, isLoading, login } = useSession();
	const [formData, setFormData] = useState({ username: "", password: "" });
	const [loading, setLoading] = useState(false);

	const handleChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.username || !formData.password) {
			toast.error("Username and password are required");
			return;
		}
		setLoading(true);
		try {
				const data = await login({
				username: formData.username,
				password: formData.password,
			});
				router(data.role === "superadmin" ? "/dashboard/users" : "/dashboard/links");
			} catch (error) {
			toast.error(`Oops! ${error.message}`);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && session.isLoggedIn)
			router(session.role === "superadmin" ? "/dashboard/users" : "/dashboard/links");
	}, [session, isLoading, router]);

	if (isLoading) return <LoadingScreenNoThanks />;

	return (
		<div className="flex items-center justify-center min-h-screen px-4">
			<div className="w-full max-w-sm">
				<div className="rounded-xl bg-surface hairline p-8">
					<Link
						to="/"
						className="short mb-6 flex items-center gap-1.5 text-sm text-dim hover:text-ink transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
							/>
						</svg>
						pendek
					</Link>
					<h1 className="text-lg font-semibold tracking-tight">Log in</h1>
					<p className="mt-1 mb-6 text-sm text-mute">
						Welcome back. Don&apos;t have an account?{" "}
						<Link to="/signup" className="text-accent hover:underline">
							Sign up
						</Link>
					</p>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="label" htmlFor="username">
								Username
							</label>
							<input
								type="text"
								name="username"
								id="username"
								value={formData.username}
								onChange={handleChange}
								className="input"
								placeholder="username"
								autoComplete="username"
							/>
						</div>
						<div>
							<label className="label" htmlFor="password">
								Password
							</label>
							<input
								type="password"
								name="password"
								id="password"
								value={formData.password}
								onChange={handleChange}
								className="input"
								placeholder="••••••••"
								autoComplete="current-password"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className={`btn btn-primary w-full ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
						>
							{loading ? "Logging in…" : "Log in"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}