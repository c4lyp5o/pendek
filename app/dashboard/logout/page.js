'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/utils/sessionMx';
import { defaultSession } from '@/utils/sessionSecret';

import { withAuth } from '@/app/dashboard/withAuth';

const Logout = () => {
  const { logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    logout(null, {
      optimisticData: defaultSession,
    });
    router.push('/');
  }, [router, logout]);

  return (
    <div className='flex items-center justify-center h-screen'>
      <p className='text-2xl'>Logging out...</p>
    </div>
  );
};

export default withAuth(Logout);
