'use client';
import Link from 'next/link';
import { useSession } from '@/utils/sessionMx';

export default function NotFound() {
  const { session } = useSession();

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen text-center'
      role='alert'
    >
      <title>404 - Page Not Found</title>
      <h1 className='mb-4 sm:text-4xl text-2xl font-bold'>
        404 - Page Not Found
      </h1>
      <span className='text-6xl' role='img' aria-label='Face in Clouds Emoji'>
        😶‍🌫️
      </span>
      <p className='text-2xl mt-4'>
        We searched high and low but could not find what you were looking for...
      </p>
      <Link href={'/' + (session && session.isLoggedIn ? 'dashboard' : '')}>
        <button
          aria-label='Go back home'
          className='bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2'
        >
          Go back home
        </button>
      </Link>
    </div>
  );
}
