import { toast } from "react-toastify";

export default function SuccessMessage({ shortCode, qrCode }) {
	const origin = window.location.origin;

	const handleCopy = () => {
		toast.success("Link copied to clipboard");
		navigator.clipboard.writeText(`${origin}/${shortCode}`);
	};

	return (
		<div className="mt-7 w-full max-w-md rounded-lg bg-raised hairline p-5 text-center">
			<div className="flex items-center justify-center gap-1.5 text-ok text-xs font-medium tracking-wide">
				<svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
					<path
						fillRule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
						clipRule="evenodd"
					/>
				</svg>
				Short link ready
			</div>
			<div className="mt-3 flex items-center justify-center gap-2">
				<a
					href={`${origin}/${shortCode}`}
					target="_blank"
					rel="noopener noreferrer"
					className="short text-accent hover:underline text-sm font-medium break-all"
				>
					{origin}/{shortCode}
				</a>
				<button
					onClick={handleCopy}
					aria-label="Copy link"
					title="Copy to clipboard"
					className="text-dim hover:text-ink hairline rounded-md p-1.5 transition-colors hover:bg-raised-hover"
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
			{qrCode && (
				<div className="mt-4 flex justify-center">
					<img
						src={qrCode}
						alt="QR Code"
						className="w-[228px] h-[228px] bg-white rounded-md"
					/>
				</div>
			)}
		</div>
	);
}