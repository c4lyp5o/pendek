'use client';
import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Links() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSWR(
    `/api/pendekmx/getall?page=${page}`,
    fetcher,
    {
      refreshInterval: 1000,
    }
  );
  const totalPages = Math.ceil(data?.totalCodes / 10);

  const convertISODate = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString();
  };

  if (error) return <ErrorScreen />;
  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-base font-semibold leading-7 text-white'>
          Your Links
        </h1>
        <Link href='/dashboard/links/create'>
          <button className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'>
            Create
          </button>
        </Link>
      </div>
      <div className='overflow-x-auto'>
        <ul
          role='list'
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        >
          {data.codes.map((link) => (
            <li
              key={link.id}
              className='col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow'
            >
              <div className='flex flex-1 flex-col p-8'>
                <Link href={`/dashboard/links/${link.code}`}>
                  <h3 className='text-blue-600 hover:underline'>{link.code}</h3>
                  <p className='text-black text-sm'>
                    Created: {convertISODate(link.createdAt)}
                  </p>
                  <ul>
                    <p className='text-black text-xs'>
                      {link.urls.map((url) => url.url).join(', ')}
                    </p>
                  </ul>
                  <p className='text-black text-sm'>
                    Accessed: {link.timesClicked} times
                  </p>
                </Link>
              </div>
            </li>
          ))}
        </ul>
        <div className='mt-5 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
          <div className='flex flex-1 justify-between sm:hidden'>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || data.totalCodes === 0}
              className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || data.totalCodes === 0}
              className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
            >
              Next
            </button>
          </div>
          <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
            <div>
              <p className='text-sm text-gray-700'>
                Showing <span className='font-medium'>1</span> to{' '}
                <span className='font-medium'>
                  {data.totalCodes < 11 ? `${data.totalCodes}` : 10}
                </span>{' '}
                of <span className='font-medium'>{totalPages}</span> results
              </p>
            </div>
            <div>
              <nav
                className='isolate inline-flex -space-x-px rounded-md shadow-sm'
                aria-label='Pagination'
              >
                {page > 1 && codes.length > 10 ? (
                  <Link href={`/dashboard/links?page=${page - 1}`}>
                    <p className='relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'>
                      <span className='sr-only'>Previous</span>
                      <ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
                    </p>
                  </Link>
                ) : (
                  <p className='relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300'>
                    <span className='sr-only'>Previous</span>
                    <ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
                  </p>
                )}
                {Array.from(
                  { length: Math.ceil(totalPages / 10) },
                  (_, i) => i + 1
                ).map((page, index) => (
                  <Link key={page} href={`/dashboard/links?page=${page}`}>
                    <p
                      className={
                        page === index + 1
                          ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }
                    >
                      {page}
                    </p>
                  </Link>
                ))}
                {page < totalPages ? (
                  <Link href={`/dashboard/links?page=${page + 1}`}>
                    <p className='relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'>
                      <span className='sr-only'>Next</span>
                      <ChevronRightIcon
                        className='h-5 w-5'
                        aria-hidden='true'
                      />
                    </p>
                  </Link>
                ) : (
                  <p className='relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300'>
                    <span className='sr-only'>Next</span>
                    <ChevronRightIcon className='h-5 w-5' aria-hidden='true' />
                  </p>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
