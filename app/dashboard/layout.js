import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/links', label: 'Links' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/logout', label: 'Logout' },
];

export default function Layout({ children }) {
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
