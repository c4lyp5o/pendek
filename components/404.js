'use client';
import Link from 'next/link';

export default function Fourohfour() {
  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen text-center'
      role='alert'
    >
      <title>404</title>
      <h1 className='mb-4 sm:text-4xl text-2xl font-bold'>Page Not Found</h1>
      <span className='text-6xl' role='img' aria-label='Face in Clouds Emoji'>
        😶‍🌫️
      </span>
      <p className='text-xl mt-4'>
        We searched high and low but could not find what you were looking for...
      </p>
      <button
        aria-label='Go back home'
        className='mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md px-4 py-2'
      >
        <Link href='/'>Go back home</Link>
      </button>
    </div>
  );
}
