'use client';
import { useSession } from '@/utils/sessionMx';

import LoadingScreenNoThanks from '@/components/loadingScreenNoThanks';

export default function Dashboard() {
  const { isLoading, session } = useSession();

  if (isLoading || !session.isLoggedIn) return <LoadingScreenNoThanks />;

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
