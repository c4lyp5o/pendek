import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'B A R A N G P E N D E K',
  description:
    'BarangPendek is a simple and efficient URL shortener built with Next.js and Prisma.',
};

export const viewport = {
  width: 1,
  themeColor: 'dark',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
