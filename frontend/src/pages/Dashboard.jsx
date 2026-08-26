import { useSession } from "../context/session";
import { Link } from "react-router-dom";
import { LinkIcon, GlobeEuropeAfricaIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
	const { session } = useSession();

	return (
		<>
			<h1 className="text-lg font-semibold tracking-tight">
				Hey, {session.username} <span className="text-mute font-normal">👋</span>
			</h1>
			<p className="mt-1 text-sm text-mute">
				Shorten links, manage them, and ship them anywhere.
			</p>

			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl">
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
								Manage links
							</h2>
							<p className="text-sm text-mute mt-0.5">
								View, edit, and track your link
							</p>
						</div>
					</div>
				</Link>
			</div>
		</>
	);
}