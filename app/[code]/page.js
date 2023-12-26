'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

import LoadingScreen from '@/components/loadingScreen';
import Fourohfour from '@/components/404';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { code } = useParams();
  const { data, error } = useSWR(`/api/pendek?code=${code}`, fetcher);

  if (!data) return <LoadingScreen />;
  if (error) return <Fourohfour />;

  if (data.isMultiple) {
    return (
      <main className='flex flex-col items-center justify-center min-h-screen py-2'>
        <title>{code}</title>
        <h1 className='text-4xl mb-4'>Your URLs:</h1>
        <ul className='space-y-2'>
          {data.urls.map((urlObject) => (
            <li key={urlObject.url} className='border p-2 rounded-md'>
              <a href={urlObject.url} target='_blank' rel='noopener noreferrer'>
                <p className='text-blue-500 hover:underline'>
                  {urlObject.tag || urlObject.url}
                </p>
              </a>
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
