'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/utils/sessionMx';

import LoadingScreen from '@/components/loadingScreen';

export function withAuth(WrappedComponent) {
  const WithAuthWrapper = (props) => {
    const router = useRouter();
    const { isLoading, session } = useSession();

    useEffect(() => {
      if (!session.isLoggedIn && !isLoading) {
        router.push('/');
      }
    }, [router, session, isLoading]);

    if (isLoading) return <LoadingScreen />;

    return <WrappedComponent {...props} />;
  };

  WithAuthWrapper.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuthWrapper;
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
