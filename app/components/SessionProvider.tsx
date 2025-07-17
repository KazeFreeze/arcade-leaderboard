// app/components/SessionProvider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// This is a client-side component that makes the session data
// available to all other client components in your app.
export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
