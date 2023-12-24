'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/utils/sessionMx';

export default function Logout() {
  const { logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    logout(null);
    router.replace('/');
  }, [router, logout]);

  return (
    <div className='flex items-center justify-center h-screen'>
      <p className='text-2xl animate-pulse'>Logging out...</p>
    </div>
  );
}
