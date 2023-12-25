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
      <Link
        href={'/' + (session && session.isLoggedIn ? 'dashboard' : '')}
        className='mt-4 text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500'
        aria-label='Go back to homepage'
      >
        Go back to homepage
      </Link>
    </div>
  );
}
