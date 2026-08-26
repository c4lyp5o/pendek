import { useSession } from "../context/session";
import { Link } from "react-router-dom";
import { LinkIcon, GlobeEuropeAfricaIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
	const { session } = useSession();
	const isSuperadmin = session.role === "superadmin";

	return (
		<>
			<h1 className="text-lg font-semibold tracking-tight">
				Hey, {session.username} <span className="text-mute font-normal">👋</span>
			</h1>
			<p className="mt-1 text-sm text-mute">
				{isSuperadmin
					? "Manage users, create accounts, and assign roles."
					: "Shorten links, manage them, and ship them anywhere."}
			</p>

			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl">
				{isSuperadmin ? (
					<Link
						to="/dashboard/users"
						className="group relative rounded-lg bg-surface hairline p-6 transition-colors hover:bg-raised"
					>
						<div className="flex items-center gap-4">
							<div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-dim text-accent">
								<UserGroupIcon className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-sm font-semibold text-ink">
									Manage Users
								</h2>
								<p className="text-sm text-mute mt-0.5">
									Create, delete, and reset user accounts
								</p>
							</div>
						</div>
					</Link>
				) : (
					<>
						<Link
							to="/"
							className="group relative rounded-lg bg-surface hairline p-6 transition-colors hover:bg-raised"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-dim text-accent">
									<LinkIcon className="h-5 w-5" />
								</div>
								<div>
									<h2 className="text-sm font-semibold text-ink">
										Shorten a link
									</h2>
									<p className="text-sm text-mute mt-0.5">
										Quick public short link
									</p>
								</div>
							</div>
						</Link>
						<Link
							to="/dashboard/links"
							className="group relative rounded-lg bg-surface hairline p-6 transition-colors hover:bg-raised"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-11 w-11 items-center justify-center rounded-md bg-accent-dim text-accent">
									<GlobeEuropeAfricaIcon className="h-5 w-5" />
								</div>
								<div>
									<h2 className="text-sm font-semibold text-ink">
										Your links
									</h2>
									<p className="text-sm text-mute mt-0.5">
										View and manage existing short links
									</p>
								</div>
							</div>
						</Link>
					</>
				)}
			</div>
		</>
	);
}