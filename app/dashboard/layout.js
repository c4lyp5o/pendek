'use client';
import Link from 'next/link';
import { useSession } from '@/utils/sessionMx';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoadingScreen from '@/components/loadingScreen';

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/links', label: 'Links' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/logout', label: 'Logout' },
];

export default function ProtectedLayout({ children }) {
  const { session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session.isLoggedIn) {
      router.replace('/');
    }
  }, [isLoading, session.isLoggedIn, router]);

  if (isLoading) return <LoadingScreen />;

  return (
    <main className='flex h-screen'>
      <div className='p-6 w-64 bg-black text-white'>
        <h2 className='text-2xl font-semibold mb-5'>Dashboard</h2>
        <nav>
          <ul>
            {links.map((link) => (
              <li className='mb-3' key={link.href}>
                <Link href={link.href}>
                  <p className='text-white hover:text-gray-300'>{link.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className='p-6 flex-grow border-l border-gray-200 bg-black text-white'>
        {children}
      </div>
    </main>
  );
}
