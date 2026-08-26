import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function ExpandedQrCode({ qrCode, isModalOpen, setIsModalOpen }) {
	return (
		<Transition.Root show={isModalOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={setIsModalOpen}>
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

				<div className="fixed inset-0 z-10 flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enterTo="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 translate-y-0 sm:scale-100"
						leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					>
						<Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-surface hairline px-6 pb-6 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
							<div>
								<div className="mt-3 text-center sm:mt-5">
									<Dialog.Title
										as="h3"
										className="text-base font-semibold leading-6 text-ink"
									>
										QR Code
									</Dialog.Title>
									<div className="mt-4 flex justify-center">
										<img
											src={qrCode}
											alt="QR Code"
											className="w-64 h-64 bg-white rounded-md"
										/>
									</div>
									<div className="mt-6">
										<button
											type="button"
											onClick={() => setIsModalOpen(false)}
											className="btn btn-primary w-full sm:w-auto"
										>
											Close
										</button>
									</div>
								</div>
							</div>
						</Dialog.Panel>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
}