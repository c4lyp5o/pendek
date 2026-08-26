import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useSession } from "../context/session";
import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";

export default function Signup() {
	const router = useNavigate();
	const { session, isLoading, signup } = useSession();
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
		if (formData.password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}
		setLoading(true);
		try {
			await signup({
				username: formData.username,
				password: formData.password,
			});
			toast.success("Account created. Welcome!");
			router("/dashboard/links");
		} catch (error) {
			toast.error(`Oops! ${error.message}`);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isLoading && session.isLoggedIn) router("/dashboard/links");
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
					<h1 className="text-lg font-semibold tracking-tight">Sign up</h1>
					<p className="mt-1 mb-6 text-sm text-mute">
						Already have an account?{" "}
						<Link to="/login" className="text-accent hover:underline">
							Log in
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
								placeholder="8+ characters"
								autoComplete="new-password"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className={`btn btn-primary w-full ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
						>
							{loading ? "Creating…" : "Create account"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}