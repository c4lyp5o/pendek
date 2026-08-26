import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import UrlInput from "../components/urlInput";

export default function AddLink() {
	const navigate = useNavigate();
	const [code, setCode] = useState("");
	const [urls, setUrls] = useState([""]);
	const [tags, setTags] = useState([""]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (urls.some((url) => !url)) {
			toast.error("URL is required");
			return;
		}

		// Empty code is allowed -> backend auto-generates one.
		if (code.trim()) {
			const trimmed = code.trim();
			if (trimmed.match(/[^a-zA-Z0-9]|^(dashboard|login|signup|api)$/i)) {
				toast.error("Invalid code");
				return;
			}

			if (trimmed.length < 4) {
				toast.error("Code must be at least 4 characters");
				return;
			}

			if (trimmed.length > 25) {
				toast.error("Code must be less than 25 characters");
				return;
			}
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

			const response = await fetch("/api/links/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ code: code.trim(), urls, tags }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message);
			}

			toast.success("Link created successfully");
			navigate("/dashboard/links");
		} catch (error) {
			toast.error(`Oops! ${error.message}`);
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
		<>
			<div className="flex items-center justify-between">
				<div className="min-w-0 flex-1">
					<h1 className="text-lg font-semibold tracking-tight">
						Create new link
					</h1>
				</div>
				<Link
					to="/dashboard/links"
					className="text-sm text-dim hover:text-ink transition-colors"
				>
					← Back to links
				</Link>
			</div>
			<form onSubmit={handleSubmit} className="mt-7 max-w-3xl">
				<div className="rounded-lg bg-surface hairline p-6">
					<div>
						<label htmlFor="code" className="label">
							Code
						</label>
						<p className="text-xs text-mute mt-1 mb-2">
							Custom code, 4–25 alphanumeric characters (letters &amp;
							numbers only). Leave empty to auto-generate.
						</p>
						<div>
							<input
								type="text"
								name="code"
								id="code"
								value={code}
								onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
								className="input"
								placeholder="e.g. myshortlink"
							/>
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-3">
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
					</div>
				</div>

				<div className="mt-6 flex justify-end">
					<button
						type="submit"
						disabled={loading}
						className={`btn btn-primary ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
					>
						{loading ? "Creating…" : "Create link"}
					</button>
				</div>
			</form>
		</>
	);
}