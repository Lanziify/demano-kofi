'use client';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadProfileAvatar } from '@/components/custom/upload-profile';
import { useAuthStore } from '@/store/auth-store';
import { getInitials } from '@/lib/strings';
import { DobPicker } from '@/components/custom/dob-picker';
import { profileSchema, ProfileSchemaValues } from '../schema/profile.schema';
import { getUserProfile } from '../actions/auth.actions';

export default function ProfileForm() {
  const { user } = useAuthStore();

  const { control, handleSubmit } = useForm<ProfileSchemaValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      image: '',
      username: '',
      firstName: '',
      lastName: '',
      bio: '',
      phone: '',
      dateOfBirth: '',
      address: {
        building: '',
        street: '',
        barangay: '',
        city: '',
        province: '',
        region: '',
        postalCode: '',
      },
    },
  });

  function onSubmit(values: ProfileSchemaValues) {
    try {
      console.log(values);
      toast(
        <pre className="mt-2 w-85 rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  React.useEffect(() => {
    if (!user) return;

    async function getProfileData() {
      const result = await getUserProfile(user.id);

      console.log(result.data);
    }

    getProfileData();
  }, [user]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <Field>
            <UploadProfileAvatar
              value={user?.image}
              fallback={getInitials(user?.name)}
              onChange={(file) => field.onChange(file)}
            />

            {/* {fieldState.invalid && <FieldError errors={[fieldState.error]} />} */}
          </Field>
        )}
      />

      <FieldSet>
        <FieldLegend>Personal Information</FieldLegend>
        <FieldDescription>
          Keep your profile up to date to ensure accurate records and a
          personalized experience.
        </FieldDescription>
        <FieldGroup className="grid grid-cols-2">
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                <Input {...field} placeholder="New username" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="col-start-1">
                <FieldLabel htmlFor={field.name}>First name</FieldLabel>
                <Input {...field} placeholder="Juan" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Last name</FieldLabel>
                <Input {...field} placeholder="Cruz" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="bio"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="col-span-full">
                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                <Textarea
                  {...field}
                  placeholder="Tell us something about yourself"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DobPicker
                value={field.value}
                onChange={(value) => field.onChange(value)}
                className="col-span-full"
              />
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Contact Details</FieldLegend>
        <FieldDescription>
          Ensure your contact information is current for account notifications,
          verification, and recovery.
        </FieldDescription>
        <FieldGroup>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                <Input {...field} type="tel" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Address Information</FieldLegend>

        <FieldDescription>
          Keep your address information up to date for accurate records and
          deliveries.
        </FieldDescription>

        <FieldGroup>
          <Controller
            name="address.building"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  House/Unit No., Building
                </FieldLabel>

                <Input {...field} placeholder="Unit 12B, ABC Tower" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="address.street"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Street</FieldLabel>

                <Input {...field} placeholder="Ayala Avenue" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="address.barangay"
            control={control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Barangay</FieldLabel>

                <Input {...field} placeholder="Bel-Air" />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="address.city"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    City / Municipality
                  </FieldLabel>

                  <Input {...field} placeholder="Makati City" />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address.province"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Province</FieldLabel>

                  <Input {...field} placeholder="Metro Manila" />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="address.region"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Region</FieldLabel>

                  <Input {...field} placeholder="NCR" />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address.postalCode"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Postal Code</FieldLabel>

                  <Input {...field} placeholder="1209" />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </FieldSet>
      <Button type="submit" className="col-span-full">
        Update Profile
      </Button>
    </form>
  );
}
