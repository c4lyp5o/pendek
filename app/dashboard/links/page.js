'use client';
import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';

import { withAuth } from '@/app/dashboard/withAuth';

import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      return data;
    });

const Links = () => {
  const [page, setPage] = useState(1);
  const { data, error } = useSWR(`/api/pendekmx/getall?page=${page}`, fetcher);
  const totalPages = Math.ceil(data?.totalCodes / 10);

  if (error) return <ErrorScreen />;
  if (!data) return <LoadingScreen />;

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-xl font-bold'>Your Links</h1>
        <Link href='/dashboard/links/create'>
          <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
            Create
          </button>
        </Link>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='text-left border-b border-gray-300'>
              <th className='px-4 py-3'>Link</th>
              <th className='px-4 py-3'></th>
            </tr>
          </thead>
          <tbody>
            {data.codes.map((link, index) => (
              <tr key={index} className='border-b border-gray-200'>
                <td className='px-4 py-3'>
                  <Link href={`/dashboard/links/${link.code}`}>
                    <p className='text-blue-600 hover:underline'>{link.code}</p>
                    <span>- Accessed: {link.timesClicked} times</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex items-center justify-between mt-4'>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              page === 1
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className='text-sm font-medium'>Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              page === totalPages
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default withAuth(Links);
