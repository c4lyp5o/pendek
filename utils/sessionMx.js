import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { defaultSession } from './sessionSecret';

const sessionApiRoute = '/api/usermx';
// const superadminApiRoute = '/api/superusermx';

async function fetchJson(input, init) {
  const response = await fetch(input, {
    ...init,
  });

  if (!response.ok) {
    const error = await response.json();
    error.status = response.status;
    throw error;
  }

  const data = await response.json();

  return data;
}

async function doLogin(url, { arg }) {
  const toServerFormData = new FormData();
  toServerFormData.append('username', arg.username);
  toServerFormData.append('password', arg.password);
  toServerFormData.append('rememberMe', arg.rememberMe);

  return fetchJson(url, {
    method: 'POST',
    body: toServerFormData,
  });
}

function doLogout(url) {
  return fetchJson(url, {
    method: 'DELETE',
  });
}

export function useSession() {
  const { data: session, isLoading } = useSWR(sessionApiRoute, fetchJson, {
    fallbackData: defaultSession,
  });

  const { trigger: login } = useSWRMutation(sessionApiRoute, doLogin, {
    revalidate: false,
    populateCache: true,
  });

  const { trigger: logout } = useSWRMutation(sessionApiRoute, doLogout, {
    revalidate: false,
    populateCache: true,
  });

  // const { data: sessionSuper, isLoading: isLoadingSuper } = useSWR(
  //   superadminApiRoute,
  //   fetchJson,
  //   {
  //     fallbackData: { isSuperAdmin: false },
  //   }
  // );

  // const { trigger: loginSuper } = useSWRMutation(superadminApiRoute, doLogin, {
  //   revalidate: false,
  //   populateCache: true,
  // });

  // const { trigger: logoutSuper } = useSWRMutation(superadminApiRoute, doLogout);

  return {
    session,
    login,
    logout,
    // sessionSuper,
    // loginSuper,
    // logoutSuper,
    isLoading,
    // isLoadingSuper,
  };
}
