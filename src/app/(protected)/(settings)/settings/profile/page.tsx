'use client';

import ProfileForm from '@/feature/auth/components/profile-form';

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and account details.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
