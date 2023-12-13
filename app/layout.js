import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'B R G P D K',
  description:
    'BRGPDK is a simple and efficient URL shortener built with Next.js and Prisma.',
};

export const viewport = {
  width: 1,
  themeColor: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
      <ToastContainer />
    </html>
  );
}
