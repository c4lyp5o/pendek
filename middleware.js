import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { sessionOptions } from '@/utils/sessionSecret';
// import { getIronSession } from 'iron-session';
import rateLimit from './utils/rateLimit';
import slowDown from './utils/slowDown';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 menit
  uniqueTokenPerInterval: 100, // jumlah pengguna yang diperbolehkan request per interval
});

const speedLimiter = slowDown({
  delayAfter: 50, // jumlah request yang perlu ada sebelum delay
  delayMs: 100, // delay dalam milisecond
});

const pendekPathHandler = async (request) => {
  const tokenName =
    request.headers['x-real-ip'] || request.headers['x-forwarded-for'];
  try {
    await limiter.check(request, 10, tokenName);
    await speedLimiter.delay(request, tokenName);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }
};

const pendekMxPathHandler = async (request) => {
  // const session = await getIronSession(cookies(), sessionOptions);

  // if (session.isLoggedIn !== true) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.rewrite(url);
  // }

  // if (Date.now() - session.loginTime > process.env.LOGOUT_TIME) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.rewrite(url);
  // }

  return NextResponse.next();
};

export async function middleware(request) {
  const pendekMx = new RegExp('^/api/pendekmx');

  switch (true) {
    case request.nextUrl.pathname === '/api/pendek':
      return pendekPathHandler(request);
    case pendekMx.test(request.nextUrl.pathname):
      return pendekMxPathHandler(request);
    default:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ['/api/pendek', '/api/pendekmx/:path*'],
};
