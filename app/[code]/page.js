'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import LoadingScreen from '@/components/loadingScreen';
import ErrorScreen from '@/components/errorScreen';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { code } = useParams();
  const { data, error } = useSWR(
    code ? `/api/pendek?code=${code}` : null,
    fetcher
  );

  if (error) return <ErrorScreen />;
  if (!data) return <LoadingScreen />;

  if (data.isMultiple) {
    return (
      <main className='flex flex-col items-center justify-center min-h-screen py-2'>
        <title>{code}</title>
        <h1 className='text-4xl mb-4'>Your URLs:</h1>
        <ul className='space-y-2'>
          {data.urls.map((urlObject, index) => (
            <li key={index} className='border p-2 rounded-md'>
              <Link href={urlObject.url}>
                <p className='text-blue-500 hover:underline'>
                  {urlObject.tag || urlObject.url}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  } else {
    window.location.href = data.urls[0].url;
    return null;
  }
}
