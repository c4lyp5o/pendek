'use client';
import { useSession } from '@/utils/sessionMx';

import LoadingScreen from '@/components/loadingScreen';

export default function Dashboard() {
  const { isLoading, session } = useSession();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <h1 className='text-2xl font-semibold'>
        Welcome to the Main Page, {session.username}
      </h1>
      <p className='mt-4 text-gray-600'>
        This is your personalized dashboard. Feel free to explore and let us
        know if you need any assistance.
      </p>
    </>
  );
}
