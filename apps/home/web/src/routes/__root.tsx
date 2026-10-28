import { useEffect, type ReactElement } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { EVENTS, track } from '@/lib/track';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout(): ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}

/** Unknown paths: reported as a '404' event so broken inbound links show up
 *  in the dashboard (the SPA serves index.html for every path). */
function NotFound(): ReactElement {
  useEffect(() => {
    track(EVENTS.NOT_FOUND, { path: location.pathname.slice(0, 500) });
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F6F5F2] px-6 text-center text-[#3D3B4F]">
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-[#9B9590]">404</p>
      <h1 className="text-[24px] font-bold tracking-tight">This page doesn&rsquo;t exist.</h1>
      <a
        href="/"
        className="inline-flex h-10 items-center rounded-full bg-[#3D3B4F] px-5 text-[13px] font-semibold text-white"
      >
        Back to Traks
      </a>
    </div>
  );
}
