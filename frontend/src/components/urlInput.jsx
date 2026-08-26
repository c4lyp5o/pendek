export default function UrlInput({
	urls,
	url,
	tag,
	updateUrl,
	updateTag,
	addUrlInput,
	removeUrlInput,
	index,
}) {
	const isLast = index === urls.length - 1;
	return (
		<div className="rounded-lg hairline bg-surface p-4 shadow-sm">
			<div className="flex items-start gap-3">
				<div className="flex-1 space-y-3">
					<div>
						<label htmlFor={`url-${index}`} className="label">
							URL
						</label>
						<input
							type="url"
							name="url"
							id={`url-${index}`}
							value={url || ""}
							onChange={(e) => updateUrl(index, e.target.value)}
							className="input"
							placeholder="https://www.google.com"
							autoComplete="off"
						/>
					</div>
					<div>
						<div className="flex justify-between items-baseline">
							<label htmlFor={`tag-${index}`} className="label !mb-0">
								Site tag
							</label>
							<span className="text-[11px] text-mute" id="tag-optional">
								optional
							</span>
						</div>
						<input
							type="text"
							name="tag"
							id={`tag-${index}`}
							value={tag || ""}
							onChange={(e) => updateTag(index, e.target.value)}
							className="input mt-1"
							placeholder="Google"
							aria-describedby="tag-optional"
						/>
					</div>
				</div>

				<div className="flex flex-col items-center gap-2 pt-6">
					{isLast && (
						<button
							type="button"
							onClick={addUrlInput}
							aria-label="Add URL"
							title="Add another URL"
							className="text-dim hover:text-ink hairline rounded-md p-1.5 transition-colors hover:bg-raised"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-4 h-4"
							>
								<path
									fillRule="evenodd"
									d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}
					{urls.length > 1 && (
						<button
							type="button"
							onClick={() => removeUrlInput(index)}
							aria-label="Remove URL"
							title="Remove this URL"
							className="text-mute hover:text-danger hairline rounded-md p-1.5 transition-colors hover:bg-raised"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-4 h-4"
							>
								<path
									fillRule="evenodd"
									d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.498.058l.346-9z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					)}
				</div>
			</div>
		</div>
	);
}