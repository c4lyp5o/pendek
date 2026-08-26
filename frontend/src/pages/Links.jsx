import { useState } from "react";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";
import ErrorScreen from "../components/errorScreen";

const fetcher = (url) =>
	fetch(url, { credentials: "include" }).then((res) => {
		if (!res.ok) throw new Error("Failed to load");
		return res.json();
	});

export default function Links() {
	const [page, setPage] = useState(1);
	const { data, isLoading, error } = useSWR(
		`/api/links/?page=${page}&pageSize=10`,
		fetcher
	);
	const totalPages = Math.max(1, Math.ceil((data?.totalCodes || 0) / 10));

	const convertISODate = (date) => new Date(date).toLocaleDateString();

	if (error) return <ErrorScreen />;
	if (isLoading) return <LoadingScreenNoThanks />;

	const perPage = data.pageSize || 10;
	const start = data.codes.length ? (page - 1) * perPage + 1 : 0;
	const end = Math.min((page - 1) * perPage + data.codes.length, data.totalCodes);

	return (
		<>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-lg font-semibold tracking-tight">Your Links</h1>
				<Link to="/dashboard/links/create" className="btn btn-primary !px-3.5 !py-1.5 text-sm">
					<span className="flex items-center gap-1.5">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="2"
							stroke="currentColor"
							className="w-3.5 h-3.5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
						Create
					</span>
				</Link>
			</div>

			{data.codes.length === 0 ? (
				<div className="rounded-lg bg-surface hairline p-10 text-center">
					<p className="short text-sm text-mute">No</p>
					<p className="mt-1 text-sm text-mute">
						You haven&apos;t created any links yet.{" "}
						<Link to="/dashboard/links/create" className="text-accent hover:underline">
							Create your first one
						</Link>
						.
					</p>
				</div>
			) : (
				<>
					<ul
						role="list"
						className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
					>
						{data.codes.map((link) => (
							<li
								key={link.id}
								className="col-span-1 rounded-lg bg-surface hairline transition-colors hover:bg-raised"
							>
								<Link to={`/dashboard/links/${link.id}`} className="block p-5">
									<h3 className="short text-accent text-sm font-medium break-all hover:underline">
										{link.code}
									</h3>
									<p className="mt-3 text-xs text-mute">
										Created {convertISODate(link.createdAt)}
									</p>
									<p className="mt-1 text-sm text-ink truncate">
										{link.urls.map((u) => u.url).join(", ")}
									</p>
									<p className="mt-2 inline-flex items-center gap-1.5 text-xs text-dim">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth="1.5"
											stroke="currentColor"
											className="w-3.5 h-3.5"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M3.75 4.5h16.5M4.5 4.5v13.5H21m-13.5-3H21L17.25 9M7.5 13.5H4.5L7.5 9"
											/>
										</svg>
										{link.timesClicked} clicks
									</p>
								</Link>
							</li>
						))}
					</ul>

					{data.codes.length > 0 && (
						<div className="mt-6 flex items-center justify-between hairline-t pt-4">
							<p className="text-xs text-mute">
								Showing <span className="text-ink font-medium">{start}</span>–
								<span className="text-ink font-medium">{end}</span> of{" "}
								<span className="text-ink font-medium">{data.totalCodes}</span>
							</p>
							<nav
								className="isolate inline-flex items-center gap-2"
								aria-label="Pagination"
							>
								<button
									onClick={() => setPage(page - 1)}
									disabled={page === 1}
									className="btn btn-ghost !px-2 !py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<span className="sr-only">Previous</span>
									<ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
								</button>
								<span className="short text-xs text-dim">
									{page} / {totalPages}
								</span>
								<button
									onClick={() => setPage(page + 1)}
									disabled={page === totalPages}
									className="btn btn-ghost !px-2 !py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
								>
									<span className="sr-only">Next</span>
									<ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
								</button>
							</nav>
						</div>
					)}
				</>
			)}
		</>
	);
}