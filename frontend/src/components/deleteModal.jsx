import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { toast } from "react-toastify";

export default function DeleteModal({ code, frontLoading }) {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleDelete = () => {
		const deleteLink = async () => {
			setLoading(true);
			try {
				const response = await fetch(`/api/links/${code.id}`, {
					method: "DELETE",
					credentials: "include",
				});

				if (response.ok) {
					setIsOpen(false);
					toast.success("Link deletion succeeded");
					navigate("/dashboard/links");
				} else {
					toast.error("Failed to delete link");
				}
			} catch (error) {
				console.error(error);
				toast.error("Failed to delete link");
			} finally {
				setIsOpen(false);
				setLoading(false);
			}
		};

		deleteLink();
	};

	return (
		<div>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				disabled={frontLoading}
				className={`btn btn-danger ${frontLoading ? "opacity-60 cursor-not-allowed" : ""}`}
			>
				Delete
			</button>

			<Transition.Root show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-10"
					onClose={setIsOpen}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black/60 transition-opacity" />
					</Transition.Child>
					<div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-0">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
							enterTo="opacity-100 translate-y-0 sm:scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						>
							<Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-surface hairline w-full sm:max-w-lg">
								<div className="px-6 pb-4 pt-6">
									<div className="sm:flex sm:items-start">
										<div className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-danger-dim sm:mx-0">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												strokeWidth="1.5"
												stroke="currentColor"
												className="h-5 w-5 text-danger"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
												/>
											</svg>
										</div>
										<div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
											<Dialog.Title className="text-base font-semibold leading-6 text-ink">
												Delete link?
											</Dialog.Title>
											<div className="mt-2">
												<p className="text-sm text-mute">
													Are you sure you want to delete{" "}
													<span className="short text-danger">
														{code.code}
													</span>
													? This action permanently deletes the link and all its
													URLs. This cannot be undone.
												</p>
											</div>
										</div>
									</div>
								</div>
								<div className="px-6 pb-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
									<button
										type="button"
										disabled={loading}
										onClick={handleDelete}
										className={`btn btn-danger w-full sm:w-auto ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
									>
										{loading ? "Deleting…" : "Delete"}
									</button>
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
									>
										Cancel
									</button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition.Root>
		</div>
	);
}