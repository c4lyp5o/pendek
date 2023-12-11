'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/utils/sessionMx';

export default function Login() {
  const router = useRouter();
  const { session, isLoading, login } = useSession();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(
        {
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
        },
        {
          optimisticData: {
            isLoggedIn: true,
            username: formData.username,
          },
        }
      );
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session.isLoggedIn && !isLoading) {
      router.push('/dashboard');
    }
  }, [session, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className='flex items-center justify-center h-screen bg-black'>
      <div className='p-10 bg-white rounded shadow-2xl w-96'>
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
            <label className='flex items-center text-black'>
              <input
                type='checkbox'
                name='rememberMe'
                onChange={handleChange}
                className='mr-2'
              />
              Remember Me
            </label>
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
              'Log In'
            )}
          </button>
          {error && (
            <p className='text-red-500 mt-3'>
              😢 Oops! Something went wrong: {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
