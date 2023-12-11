'use client';
import { useSession } from '@/utils/sessionMx';
import { withAuth } from './withAuth';

const Dashboard = () => {
  const { session } = useSession();

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
};

export default withAuth(Dashboard);
