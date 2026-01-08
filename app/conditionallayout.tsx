'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/app/components/navbar';
import Footer from '@/app/components/footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define routes that should NOT have header/footer
  const routesWithoutLayout = ['/login', '/register','/admin-panel/orders'];

  // Check if current route should hide layout
  const shouldHideLayout = routesWithoutLayout.some((route) =>
    pathname.startsWith(route)
  );

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}