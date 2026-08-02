'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '../ui/button';

export default function SignoutButton() {
  const router = useRouter();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
    router.replace('/signin');
  };

  return (
    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
      <LogOut />
      Sign out
    </Button>
  );
}
