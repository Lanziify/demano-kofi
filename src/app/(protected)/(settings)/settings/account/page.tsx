'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import AccountEmailForm from './_components/email-change-form';
import AccountPasswordForm from './_components/password-change-form';
import AccountUsernameForm from './_components/username-change-form';

export default function AccountPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground">
          Manage your account settings, login information, and security
          preferences.
        </p>
      </div>

      <div className="space-y-6">
        <AccountUsernameForm />
        <AccountEmailForm />
        <AccountPasswordForm />

        <Card className="bg-destructive/10 text-destructive border-destructive">
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription className="text-destructive/80">
              Once you delete this account, there is no going back.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Please be certain before proceeding.</p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive">Delete Account</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
