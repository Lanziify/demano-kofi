"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadProfileAvatar } from "@/components/custom/upload-profile";
import { useAuthStore } from "@/store/auth-store";
import { getInitials } from "@/lib/strings";
import { DobPicker } from "@/components/custom/dob-picker";
import { profileSchema, ProfileSchemaValues } from "../schema/profile.schema";
import { useUserQueries } from "../hooks/use-user-queries";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, toDate } from "@/lib/date";
import { useUpdateUserProfile } from "../mutations/user.mutation";
import { usePsgcQueries } from "../hooks/use-psgc-quries";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfileForm() {
  const { user } = useAuthStore();
  const { userProfile } = useUserQueries();
  const updateProfile = useUpdateUserProfile();
  const initialized = React.useRef(false);

  const defaultFormValues = {
    image: "",
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    dateOfBirth: "",
    building: "",
    street: "",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileSchemaValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  const { regions, provinces, municipalities, barangays } = usePsgcQueries({
    region: watch("region") ?? "",
    province: watch("province") ?? "",
    municipality: watch("municipality") ?? "",
  });

  async function onSubmit(values: ProfileSchemaValues) {
    await updateProfile.mutateAsync({ ...values, userId: user?.id! });

    if (updateProfile.isError) {
      toast.error(updateProfile.error.message);
    }

    toast.success("Profile updated!");
  }

  React.useEffect(() => {
    if (!userProfile.data || initialized.current) return;

    const profile = userProfile.data.profile;

    const values = {
      ...defaultFormValues,
      image: userProfile.data.image ?? "",
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      dateOfBirth: profile?.dateOfBirth
        ? formatDate(toDate(profile.dateOfBirth))
        : "",
      building: profile?.building ?? "",
      street: profile?.street ?? "",
      region: profile?.region ?? "",
      province: profile?.province ?? "",
      municipality: profile?.municipality ?? "",
      barangay: profile?.barangay ?? "",
    };

    reset(values);

    initialized.current = true;
  }, [userProfile.data, reset]);

  if (userProfile.isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
        <CardDescription>
          Update your personal information, contact details, address, and
          profile photo to keep your account information current.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <Field>
                  <UploadProfileAvatar
                    value={field.value}
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
              <FieldGroup className="grid md:grid-cols-2">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field
                      className="col-start-1"
                      data-invalid={fieldState.invalid}
                    >
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
                    <Field data-invalid={fieldState.invalid}>
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
                  render={({ field, fieldState }) => (
                    <DobPicker
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      className="col-span-full"
                      fieldState={fieldState}
                    />
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <FieldSet>
              <FieldLegend>Contact Details</FieldLegend>
              <FieldDescription>
                Ensure your contact information is current for account
                notifications, verification, and recovery.
              </FieldDescription>
              <FieldGroup>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <Input {...field} type="tel" placeholder="09123456789" />

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
                Keep your address information up to date for accurate records
                and deliveries.
              </FieldDescription>

              <FieldGroup className="grid md:grid-cols-2">
                <Controller
                  name="building"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-full">
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
                  name="street"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="col-span-full">
                      <FieldLabel htmlFor={field.name}>Street</FieldLabel>

                      <Input {...field} placeholder="Ayala Avenue" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="region"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Region</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {regions.data &&
                              regions.data.map((region) => (
                                <SelectItem
                                  key={region.code}
                                  value={region.name}
                                >
                                  {region.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="province"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Province</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!getValues("region")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {provinces.data &&
                              provinces.data.map((province) => (
                                <SelectItem
                                  key={province.code}
                                  value={province.name}
                                >
                                  {province.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {!getValues("region") && (
                        <FieldDescription>
                          Select a region first to use this field
                        </FieldDescription>
                      )}

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="municipality"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Municipality</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!getValues("province")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a municipality" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {municipalities.data &&
                              municipalities.data.map((municipality) => (
                                <SelectItem
                                  key={municipality.code}
                                  value={municipality.name}
                                >
                                  {municipality.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {!getValues("province") && (
                        <FieldDescription>
                          Select a province first to use this field
                        </FieldDescription>
                      )}

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="barangay"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Barangay</FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!getValues("municipality")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a barangay" />
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {barangays.data &&
                              barangays.data.map((barangay) => (
                                <SelectItem
                                  key={barangay.code}
                                  value={barangay.name}
                                >
                                  {barangay.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {!getValues("municipality") && (
                        <FieldDescription>
                          Select a municipality first to use this field
                        </FieldDescription>
                      )}

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="profile-form"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting && <Spinner />}
            Update Profile
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
