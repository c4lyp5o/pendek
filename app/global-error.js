'use client';
import Link from 'next/link';

export default function GlobalError({ reset }) {
  return (
    <html>
      <body>
        <div className='flex flex-col items-center justify-center min-h-screen text-center'>
          <span className='text-6xl' role='img' aria-label='frown'>
            😞
          </span>
          <h1 className='text-2xl mt-2'>Oops! Something went wrong.</h1>
          <p className='text-gray-500'>We&apos;re working to fix this.</p>
          <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4'>
            <button
              onClick={() => reset()}
              className='bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2'
            >
              Try again
            </button>
            <button className='bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2'>
              <Link href='/'>Go back home</Link>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
