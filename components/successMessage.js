import Image from 'next/image';
import { toast } from 'react-toastify';

export default function SuccessMessage({ shortCode, qrCode }) {
  const handleCopy = () => {
    toast.success('👏 Link copied to clipboard');
    navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
  };

  return (
    <div
      className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-7 text-center'
      role='alert'
    >
      <strong className='font-bold'>Important! </strong>
      <span className='block sm:inline'>
        Your short URL is:{' '}
        <span className='flex items-center justify-center'>
          <a
            href={`${window.location.origin}/${shortCode}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline'
          >
            {window.location.origin}/{shortCode}
          </a>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='#000000'
            className='w-6 h-6 ml-2 cursor-pointer'
            onClick={handleCopy}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098 1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z'
            />
          </svg>
        </span>
        Please copy this code or save your QR code, it will only be shown once.
      </span>
      <div className='mt-4 flex justify-center'>
        <Image src={qrCode} width={250} height={250} alt='QR Code' />
      </div>
    </div>
  );
}
