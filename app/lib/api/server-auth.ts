import { cookies } from 'next/headers';
import { Me } from '@/types/me';

export async function getMe(): Promise<Me | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
    headers: {
      cookie: cookieHeader,
    },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.data;
}