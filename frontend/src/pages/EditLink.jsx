import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import { toast } from "react-toastify";

import UrlInput from "../components/urlInput";
import DeleteModal from "../components/deleteModal";
import ExpandedQrCode from "../components/expandedQrCode";
import LoadingScreenNoThanks from "../components/loadingScreenNoThanks";
import ErrorScreen from "../components/errorScreen";

export default function EditLink() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [code, setCode] = useState("");
	const [originalCode, setOriginalCode] = useState("");
	const [urls, setUrls] = useState([]);
	const [tags, setTags] = useState([]);
	const [qrCode, setQrCode] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/links/${id}`, {
					credentials: "include",
				});
				if (!res.ok) {
					if (res.status === 401 || res.status === 404) {
						navigate("/dashboard/links");
						return;
					}
					throw new Error("Failed to load link");
				}
				const link = await res.json();
				setCode(link.code);
				setOriginalCode(link.code);
				setUrls(link.urls.map((u) => u.url));
				setTags(link.urls.map((u) => u.tag || ""));
				const qr = await QRCode.toDataURL(
					`${window.location.origin}/${link.code}`
				);
				setQrCode(qr);
			} catch (e) {
				setError(true);
			}
		};
		load();
	}, [id, navigate]);

	const handleCopy = () => {
		navigator.clipboard.writeText(`${window.location.host}/${code}`);
		toast.success("Link copied to clipboard");
	};

	if (error) return <ErrorScreen onRetry={() => navigate("/dashboard/links")} />;
	if (!qrCode) return <LoadingScreenNoThanks />;

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (urls.some((url) => !url)) {
			toast.error("URL is required");
			return;
		}

		if (code.match(/[^a-zA-Z0-9]|^(dashboard|login|signup|api)$/i)) {
			toast.error("Invalid code");
			return;
		}

		try {
			setLoading(true);

			const response = await fetch(`/api/links/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ code, urls, tags }),
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message);
			}

			if (originalCode !== code) {
				toast.success("Link updated successfully. Link code changed");
			} else {
				toast.success("Link updated successfully");
			}
			navigate("/dashboard/links");
		} catch (err) {
			toast.error(`Oops! ${err.message}`);
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
		<>
			<div className="flex items-center justify-between">
				<div className="min-w-0 flex-1">
					<h1 className="text-lg font-semibold tracking-tight">Edit link</h1>
				</div>
				<Link
					to="/dashboard/links"
					className="text-sm text-dim hover:text-ink transition-colors"
				>
					← Back to links
				</Link>
			</div>

			<form onSubmit={handleSubmit} className="mt-7">
				<div className="rounded-lg bg-surface hairline p-6">
					<h2 className="text-base font-semibold">Editing link</h2>

					<div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
						<div className="w-full sm:w-auto flex-1">
							<label htmlFor="shortcode" className="label">
								Shortcode
							</label>
							<div className="mt-2 flex flex-col sm:flex-row items-stretch rounded-md bg-bg hairline focus-within:ring-2 focus-within:ring-accent/40 focus-within:ring-inset">
								<span className="short select-none flex items-center pl-3 text-mute sm:text-sm">
									{window.location.host}/
								</span>
								<input
									type="text"
									name="shortcode"
									id="shortcode"
									value={code}
									onChange={(e) =>
										setCode(e.target.value.replace(/\s/g, ""))
									}
									autoComplete="shortcode"
									className="short flex-1 bg-transparent py-2 pl-1 pr-2 text-ink focus:ring-0 sm:text-sm"
									placeholder="SuperDuperShortCode"
								/>
								<button
									type="button"
									onClick={handleCopy}
									className="short flex items-center px-3 text-mute hover:text-ink transition-colors"
									aria-label="Copy shortcode"
									title="Copy link"
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
											d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
										/>
									</svg>
								</button>
							</div>
						</div>

						<div className="sm:mt-0 w-full sm:w-auto flex justify-center sm:justify-end">
							{qrCode && (
								<div className="relative">
									<img
										className="h-40 w-40 sm:h-28 sm:w-28 bg-white rounded-md cursor-pointer"
										src={qrCode}
										alt="QR Code"
										height="64"
										width="64"
										onClick={() => {
											if (
												typeof window !== "undefined" &&
												window.innerWidth > 640
											) {
												setIsModalOpen(true);
											}
										}}
									/>
								</div>
							)}
						</div>
					</div>

					<div className="mt-7 flex flex-col gap-3">
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

				<div className="mt-6 flex items-center justify-end gap-3">
					<DeleteModal frontLoading={loading} code={{ id, code }} />
					<button
						type="submit"
						disabled={loading}
						className={`btn btn-primary ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
					>
						{loading ? "Saving…" : "Save"}
					</button>
				</div>
			</form>

			<ExpandedQrCode
				qrCode={qrCode}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
			/>
		</>
	);
}