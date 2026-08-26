import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "react-toastify";

import { useSession } from "../context/session";
import { useTheme } from "../context/theme";
import UrlInput from "../components/urlInput";
import SuccessMessage from "../components/successMessage";

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

export default function Home() {
	const navigate = useNavigate();
	const { session } = useSession();

	const [urls, setUrls] = useState([""]);
	const [tags, setTags] = useState([""]);
	const [shortCode, setShortCode] = useState("");
	const [qrCode, setQrCode] = useState(null);
	const [successMessage, setSuccessMessage] = useState(false);
	const [loading, setLoading] = useState(false);

	const reset = () => {
		setUrls([""]);
		setTags([""]);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (urls.some((url) => !url)) {
			toast.error("URL is required");
			return;
		}

		const invalid = urls.find(
			(u) => !u.trim().startsWith("http://") && !u.trim().startsWith("https://")
		);
		if (invalid) {
			toast.error(`Invalid URL: ${invalid}`);
			return;
		}

		try {
			setLoading(true);
			setSuccessMessage(false);

			const response = await fetch("/api/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ urls, tags }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message);
			}

			const shortLink = await response.json();
			const qrCode = await QRCode.toDataURL(
				`${window.location.origin}/${shortLink.code}`
			);

			setShortCode(shortLink.code);
			setQrCode(qrCode);
			setSuccessMessage(true);
			toast.success("Link created.");
			reset();
		} catch (error) {
			toast.error(`Oops! ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const addUrlInput = () => {
		setUrls([...urls, ""]);
		setTags([...tags, ""]);
	};

	const removeUrlInput = (index) => {
		setUrls(urls.filter((_, i) => i !== index));
		setTags(tags.filter((_, i) => i !== index));
	};

	const updateUrl = (index, url) => {
		const newUrls = [...urls];
		newUrls[index] = url;
		setUrls(newUrls);
	};

	const updateTag = (index, tag) => {
		const newTags = [...tags];
		newTags[index] = tag;
		setTags(newTags);
	};

	return (
		<div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12">
			{/* top-right controls */}
			<div className="absolute top-5 right-5 flex items-center gap-2">
				<ThemeToggle />
				{session.isLoggedIn ? (
					<button onClick={() => navigate("/dashboard/links")} className="btn btn-ghost">
						Dashboard
					</button>
				) : (
					<>
						<Link to="/signup" className="btn btn-ghost">
							Sign up
						</Link>
						<Link to="/login" className="btn btn-primary">
							Log in
						</Link>
					</>
				)}
			</div>

			{/* wordmark — tight, typographic */}
			<div className="mb-10 text-center">
				<h1 className="short text-4xl font-semibold tracking-tight text-ink">
					pendek
					<span className="text-accent">.</span>
				</h1>
				<p className="mt-2 text-xs text-mute">make urls small again.</p>
			</div>

			<form onSubmit={handleSubmit} className="w-full max-w-md">
				{urls.map((url, index) => (
					<UrlInput
						key={index}
						urls={urls}
						url={url}
						tag={tags[index]}
						updateUrl={updateUrl}
						updateTag={updateTag}
						addUrlInput={addUrlInput}
						removeUrlInput={removeUrlInput}
						index={index}
					/>
				))}
				<div className="mt-4 flex items-center justify-end gap-2">
					<button
						className={`btn ${loading ? "btn-ghost opacity-60 cursor-not-allowed" : "btn-primary"}`}
						type="submit"
						disabled={loading}
					>
						{loading ? "Shortening…" : "Shorten"}
					</button>
				</div>
			</form>
			{successMessage && <SuccessMessage shortCode={shortCode} qrCode={qrCode} />}
		</div>
	);
}