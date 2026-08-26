import { Fragment, useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import {
	Bars3Icon,
	HomeIcon,
	XMarkIcon,
	GlobeEuropeAfricaIcon,
	ForwardIcon,
} from "@heroicons/react/24/outline";

import { useSession } from "../context/session";
import { useTheme } from "../context/theme";
import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";

const links = [
	{ href: "/dashboard", label: "Home", icon: HomeIcon },
	{ href: "/dashboard/links", label: "Links", icon: GlobeEuropeAfricaIcon },
];

function ThemeToggle() {
	const { theme, toggle } = useTheme();
	return (
		<button
			onClick={toggle}
			aria-label="Toggle dark mode"
			className="btn btn-ghost !px-2.5 !py-1.5 text-xs"
			title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
		>
			{theme === "dark" ? "☀️" : "🌙"}
		</button>
	);
}

export default function ProtectedLayout() {
	const { session, isLoading, logout } = useSession();
	const location = useLocation();
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		if (!isLoading && !session.isLoggedIn) navigate("/login");
	}, [session, isLoading, navigate]);

	if (isLoading) return <LoadingScreenNoThanks />;

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	const SidebarBody = ({ onNavigate = () => {} }) => (
		<>
			{/* brand */}
			<div className="flex h-14 items-center justify-between px-4 hairline-b">
				<Link
					to="/"
					onClick={onNavigate}
					className="short text-base font-semibold tracking-tight text-ink"
				>
					pendek<span className="text-accent">.</span>
				</Link>
				<ThemeToggle />
			</div>
			{/* nav */}
			<nav className="flex-1 space-y-1 px-3 py-4">
				{links.map((item) => {
					const active = location.pathname.startsWith(item.href);
					return (
						<Link
												key={item.label}
												to={item.href}
												onClick={onNavigate}
												className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
								active
									? "bg-accent-dim text-ink"
									: "text-dim hover:bg-raised hover:text-ink"
							}`}
						>
							<item.icon
								className={`h-4.5 w-4.5 flex-shrink-0 ${active ? "text-accent" : "text-mute group-hover:text-dim"}`}
								aria-hidden="true"
							/>
							{item.label}
						</Link>
					);
				})}
			</nav>
			{/* logout pinned bottom */}
			<div className="px-3 pb-4 hairline-t pt-3">
				<button
					onClick={handleLogout}
					className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-dim hover:bg-raised hover:text-ink transition-colors"
				>
					<ForwardIcon
						className="h-4.5 w-4.5 flex-shrink-0 text-mute group-hover:text-dim"
						aria-hidden="true"
					/>
					Logout
				</button>
			</div>
		</>
	);

	return (
		<div className="min-h-full bg-bg">
			{/* Mobile drawer */}
			<Transition.Root show={sidebarOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50 lg:hidden"
					onClose={setSidebarOpen}
				>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/60" />
					</Transition.Child>
					<div className="fixed inset-0 flex">
						<Transition.Child
							as={Fragment}
							enter="transition ease-in-out duration-300 transform"
							enterFrom="-translate-x-full"
							enterTo="translate-x-0"
							leave="transition ease-in-out duration-300 transform"
							leaveFrom="translate-x-0"
							leaveTo="-translate-x-full"
						>
							<Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-surface">
								<button
									type="button"
									onClick={() => setSidebarOpen(false)}
									className="absolute top-4 right-4 text-mute hover:text-ink"
								>
									<span className="sr-only">Close sidebar</span>
									<XMarkIcon className="h-5 w-5" aria-hidden="true" />
								</button>
								<SidebarBody onNavigate={() => setSidebarOpen(false)} />
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col bg-surface hairline-r">
				<SidebarBody />
			</div>

			{/* Main content */}
			<div className="lg:pl-60">
				{/* Mobile top bar */}
				<div className="sticky top-0 z-10 flex h-14 items-center bg-bg/90 backdrop-blur hairline-b px-4 lg:hidden">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="text-dim hover:text-ink mr-3"
					>
						<span className="sr-only">Open sidebar</span>
						<Bars3Icon className="h-5 w-5" aria-hidden="true" />
					</button>
					<span className="short text-sm font-semibold text-ink">
						pendek<span className="text-accent">.</span>
					</span>
				</div>
				<main>
					<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}