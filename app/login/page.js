'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/utils/sessionMx';
import { toast } from 'react-toastify';

import LoadingScreenNoThanks from '@/components/loadingScreenNoThanks';

export default function Login() {
  const router = useRouter();
  const { session, isLoading, login } = useSession();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('⚠️ Username and password are required');
      return;
    }

    setLoading(true);

    try {
      await login({
        username: formData.username,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      router.push('/dashboard');
    } catch (error) {
      toast.error(`😢 Oops! ${error.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && session.isLoggedIn) router.push('/dashboard');
  }, [session, isLoading, router]);

  if (isLoading) return <LoadingScreenNoThanks />;

  return (
    <div className='p-4 sm:p-0 flex items-center justify-center h-screen'>
      <div className='p-10 bg-white rounded shadow-2xl w-96'>
        <Link href='/'>
          <p className='absolute top-3 left-3 dark:border-gray-300 border-gray-600'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='h-8 w-8'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
          </p>
        </Link>
        <h2 className='text-3xl font-bold mb-10 text-gray-800 text-center'>
          Log In
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='space-y-5'>
            <input
              type='username'
              name='username'
              placeholder='Username'
              onChange={handleChange}
              className='w-full px-4 py-2 border rounded-md text-black'
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border rounded-md text-black'
            />
            {/* <label className='flex items-center text-black'>
              <input
                type='checkbox'
                name='rememberMe'
                onChange={handleChange}
                className='mr-2'
              />
              Remember Me
            </label> */}
          </div>
          <button
            type='submit'
            disabled={loading}
            className={`w-full mt-6 px-4 py-2 rounded-md text-white ${
              loading
                ? 'bg-gray-500 animate-pulse cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-400'
            }`}
          >
            Proceed
          </button>
        </form>
      </div>
    </div>
  );
}
