'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/utils/sessionMx';
import { defaultSession } from '@/utils/sessionSecret';

export default function Logout() {
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
      <p className='text-2xl animate-pulse'>Logging out...</p>
    </div>
  );
}
