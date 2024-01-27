import Image from 'next/image';
import { toast } from 'react-toastify';

export default function LinkCreated({ shortCode, qrCode }) {
  const handleCopy = () => {
    toast.success('👏 Link copied to clipboard');
    navigator.clipboard.writeText(`${window.location.origin}/${shortCode}`);
  };

  return (
    <div
      className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-7 text-center'
      role='alert'
    >
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
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className='w-4 h-4 ml-2 cursor-pointer'
            onClick={handleCopy}
          >
            <g id='SVGRepo_bgCarrier' stroke-width='0'></g>
            <g
              id='SVGRepo_tracerCarrier'
              stroke-linecap='round'
              stroke-linejoin='round'
            ></g>
            <g id='SVGRepo_iconCarrier'>
              {' '}
              <path
                d='M10.25 2H13.75C14.9079 2 15.8616 2.87472 15.9862 3.99944L17.75 4C18.9926 4 20 5.00736 20 6.25V13.7108C19.9836 12.9693 19.4932 12.2915 18.7438 12.0711C17.8165 11.7984 16.8438 12.329 16.5711 13.2562L16.0582 15H15.3316C15.2339 14.7937 15.094 14.6033 14.9126 14.4421C14.1903 13.7999 13.0841 13.865 12.442 14.5874L10.442 16.8374C9.85266 17.5004 9.85266 18.4996 10.442 19.1627L12.442 21.4127C12.785 21.7985 13.2604 21.9968 13.739 22H6.25C5.00736 22 4 20.9926 4 19.75V6.25C4 5.00736 5.00736 4 6.25 4L8.01379 3.99944C8.13841 2.87472 9.09205 2 10.25 2ZM13.75 3.5H10.25C9.83579 3.5 9.5 3.83579 9.5 4.25C9.5 4.66421 9.83579 5 10.25 5H13.75C14.1642 5 14.5 4.66421 14.5 4.25C14.5 3.83579 14.1642 3.5 13.75 3.5Z'
                fill='#212121'
              ></path>{' '}
              <path
                d='M11.1894 18.4983L13.1894 20.7483C13.3376 20.9149 13.5433 21 13.75 21C13.9273 21.0001 14.1053 20.9376 14.2483 20.8106C14.5579 20.5354 14.5857 20.0613 14.3106 19.7517L12.7535 18L14.3106 16.2483C14.5857 15.9387 14.5579 15.4646 14.2483 15.1895C13.9465 14.9212 13.4884 14.9409 13.2106 15.2289C13.2058 15.2339 13.201 15.239 13.1963 15.2442C13.194 15.2467 13.1917 15.2492 13.1894 15.2517L11.1894 17.5017C11.1894 17.5017 11.1894 17.5017 11.1894 17.5017C10.9369 17.7859 10.9369 18.2141 11.1894 18.4983Z'
                fill='#212121'
              ></path>{' '}
              <path
                d='M17.5304 13.5383C17.6473 13.1409 18.0642 12.9136 18.4616 13.0304C18.5036 13.0428 18.5437 13.0585 18.5818 13.0772C18.6916 13.1312 18.7838 13.2101 18.8535 13.3047C18.9473 13.432 19.0002 13.5879 19.0002 13.75C19.0001 13.82 18.9902 13.8911 18.9695 13.9616L16.4695 22.4616C16.3526 22.859 15.9357 23.0864 15.5383 22.9695C15.1409 22.8526 14.9136 22.4357 15.0304 22.0383L17.5304 13.5383Z'
                fill='#212121'
              ></path>{' '}
              <path
                d='M19.7517 20.8105C19.4421 20.5354 19.4143 20.0613 19.6894 19.7517L21.2465 18L19.6894 16.2483C19.4143 15.9387 19.4421 15.4646 19.7517 15.1894C20.0613 14.9142 20.5354 14.9421 20.8106 15.2517L22.8106 17.5017C23.0631 17.7859 23.0631 18.2141 22.8106 18.4983L20.8106 20.7483C20.5354 21.0579 20.0613 21.0857 19.7517 20.8105Z'
                fill='#212121'
              ></path>{' '}
            </g>
          </svg>
        </span>{' '}
        Please copy and save your code and QR code, it will only be shown once.
      </span>
      <div className='mt-4 flex justify-center'>
        <Image src={qrCode} width={250} height={250} alt='QR Code' />
      </div>
    </div>
  );
}
