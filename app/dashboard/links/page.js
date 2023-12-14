'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import {
  EnvelopeIcon,
  PhoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import QRCode from 'qrcode';

import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Links() {
  const [page, setPage] = useState(1);
  const [qrCodeURLs, setQrCodeURLs] = useState({});
  const { data, error } = useSWR(`/api/pendekmx/getall?page=${page}`, fetcher, {
    refreshInterval: 1000,
  });
  const totalPages = Math.ceil(data?.totalCodes / 10);

  useEffect(() => {
    const generateQRCode = async () => {
      const urls = {};
      for (const link of data.codes) {
        const url = await QRCode.toDataURL(
          `${window.location.origin}/${link.code}`
        );
        urls[link.id] = url;
      }
      setQrCodeURLs(urls);
    };

    generateQRCode();
  }, [data]);

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
        {/* <table className='w-full'>
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
        </table> */}
        {/* <ul
          role='list'
          className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
        >
          {data.codes.map((link) => (
            <li
              key={link.id}
              className='col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow'
            >
              <div className='flex w-full items-center justify-between space-x-6 p-6'>
                <div className='flex-1 truncate'>
                  <div className='flex items-center space-x-3'>
                    <h3 className='truncate text-sm font-medium text-gray-900'>
                      {link.code}
                    </h3>
                    <span className='inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20'>
                      {link.role}
                    </span>
                  </div>
                  <p className='mt-1 truncate text-sm text-gray-500'>
                    {link.title}
                  </p>
                </div>
                <img
                  className='h-10 w-10 flex-shrink-0 rounded-full bg-gray-300'
                  src={qrCodeURLs[link.id]}
                  alt='QR Code'
                />
              </div>
            </li>
          ))}
        </ul> */}
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
                <img
                  className='mx-auto h-32 w-32 flex-shrink-0 rounded-full'
                  src={qrCodeURLs[link.id]}
                  alt='QR Code'
                />
                <Link href={`/dashboard/links/${link.code}`}>
                  <h3 className='text-blue-600 hover:underline'>{link.code}</h3>
                  <span>- Accessed: {link.timesClicked} times</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {/* <div className='flex items-center justify-between mt-4'>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || data.totalCodes === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              page === 1 || data.totalCodes === 0
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>
          <span className='text-sm font-medium'>Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || data.totalCodes === 0}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              page === totalPages || data.totalCodes === 0
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div> */}
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
                  <Link href={`/dashboard/links?page=${page}`}>
                    <p
                      key={page}
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
