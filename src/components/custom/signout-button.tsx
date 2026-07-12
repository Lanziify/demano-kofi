'use client';

import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function SignoutButton() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
      <LogOut />
      Sign out
    </Button>
  );
}
