import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

export default function ExpandedQrCode({
  qrCode,
  isModalOpen,
  setIsModalOpen,
}) {
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 z-10 overflow-y-auto'
        onClose={() => setIsModalOpen(false)}
      >
        <div className='min-h-screen px-4 text-center'>
          <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
          <span
            className='inline-block h-screen align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <Dialog.Title
            as='h3'
            className='text-lg leading-6 font-medium text-gray-900'
          >
            QR Code
          </Dialog.Title>
          <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl'>
            <Image
              className='h-256 w-256'
              src={qrCode}
              alt='QR Code'
              height='256'
              width='256'
            />
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
