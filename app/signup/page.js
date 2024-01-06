'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/utils/sessionMx';
import { toast } from 'react-toastify';

export default function SignUp() {
  const router = useRouter();
  const { login } = useSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username) {
      toast.error('⚠️ Username is required');
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      toast.error('⚠️ Password is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('⚠️ Passwords do not match');
      return;
    }

    setLoading(true);

    const toServerFormData = new FormData();
    toServerFormData.append('username', formData.username);
    toServerFormData.append('password', formData.password);

    try {
      const response = await fetch('/api/pendekmx/signup', {
        method: 'POST',
        body: toServerFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast.success('🎉 You have successfully signed up!');

      await login({
        username: formData.username,
        password: formData.password,
        // rememberMe: formData.rememberMe,
      });
      router.push('/dashboard');
    } catch (error) {
      toast.error(`😢 Oops! ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className='p-4 sm:p-0 flex items-center justify-center h-screen'>
      <div className='p-10 bg-white rounded-lg shadow-2xl w-96'>
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
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <div className='space-y-5'>
            <input
              type='username'
              name='username'
              placeholder='Username'
              onChange={handleChange}
              className='w-full px-4 py-2 border border-1 rounded-md text-black'
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border border-1 rounded-md text-black'
            />
            <input
              type='password'
              name='confirmPassword'
              placeholder='Confirm Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border border-1 rounded-md text-black'
            />
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
