'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const toServerFormData = new FormData();
    toServerFormData.append('username', formData.username);
    toServerFormData.append('password', formData.password);

    const response = await fetch('/api/pendekmx/login', {
      method: 'POST',
      body: toServerFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    router.push('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const toServerFormData = new FormData();
    toServerFormData.append('username', formData.username);
    toServerFormData.append('password', formData.password);

    try {
      const response = await fetch('/api/pendekmx/signup', {
        method: 'POST',
        body: toServerFormData,
      });

      if (response.ok) {
        console.log('success');
        // Handle successful signup
        await handleLogin();
      } else {
        const error = await response.json();
        console.log('error', error);
        // Handle error during signup
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-black'>
      <div className='p-10 bg-white rounded-lg shadow-2xl w-96'>
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
              className='w-full px-4 py-2 border rounded-md text-black'
            />
            <input
              type='password'
              name='password'
              placeholder='Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border rounded-md text-black'
            />
            <input
              type='password'
              name='confirmPassword'
              placeholder='Confirm Password'
              onChange={handleChange}
              className='w-full px-4 py-2 border rounded-md text-black'
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className={`w-full mt-6 px-4 py-2 rounded-md ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'text-white bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? (
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
            ) : (
              'Proceed'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
