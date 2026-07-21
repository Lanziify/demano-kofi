'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useUserQueries } from '@/feature/auth/hooks/use-user-queries';
import { useAuthStore } from '@/store/auth-store';
import { Spinner } from '@/components/ui/spinner';

const mockAddresses = [
  {
    id: '1',
    label: 'Home',
    building: 'Unit 1208, The Rise Makati',
    street: 'Malugay Street',
    barangay: 'San Antonio',
    city: 'Makati',
    province: 'Metro Manila',
    postalCode: '1203',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Parents',
    building: '123 Rizal Avenue',
    street: 'Rizal Avenue',
    barangay: 'Poblacion',
    city: 'Makati',
    province: 'Metro Manila',
    postalCode: '1210',
    isDefault: false,
  },
  {
    id: '3',
    label: 'Office',
    building: '8F RCBC Plaza',
    street: 'Ayala Avenue',
    barangay: 'Bel-Air',
    city: 'Makati',
    province: 'Metro Manila',
    postalCode: '1227',
    isDefault: false,
  },
];

export default function AddressPage() {
  const [selected, setSelected] = React.useState(
    mockAddresses.find((a) => a.isDefault)?.id ?? ''
  );
  const { user } = useAuthStore();

  const { userAddresses } = useUserQueries({
    userId: user?.id,
  });

  if (userAddresses.isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  console.log(userAddresses.data)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Addresses</h1>
          <p className="text-muted-foreground">
            Manage your saved addresses and choose your default address.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 size-4" />
          Add Address
        </Button>
      </div>

      <RadioGroup value={selected} onValueChange={setSelected}>
        <div className="space-y-4">
          {mockAddresses.map((address) => (
            <Card
              key={address.id}
              className={`transition-colors ${
                selected === address.id ? 'border-primary' : ''
              }`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <RadioGroupItem
                    value={address.id}
                    id={address.id}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={address.id}
                        className="cursor-pointer text-base font-semibold">
                        {address.label}
                      </Label>

                      {address.isDefault && <Badge>Default</Badge>}
                    </div>

                    <CardDescription className="mt-2 space-y-1 text-sm">
                      <p>{address.building}</p>
                      <p>{address.street}</p>
                      <p>{address.barangay}</p>
                      <p>
                        {address.city}, {address.province} {address.postalCode}
                      </p>
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost">
                      <Pencil className="size-4" />
                    </Button>

                    <Button size="icon" variant="ghost">
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {selected === address.id && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm">
                    This address will be used by default.
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button>Save Default Address</Button>
      </div>
    </div>
  );
}
