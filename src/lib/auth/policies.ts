export type Policy = {
  [key: string]: PolicyFields;
};

export type PolicyFields = {
  label: string;
  description: string;
  actions: Record<string, PolicyActionMeta>;
};

export type PolicyActionMeta = {
  label: string;
  description: string;
};

export type PolicyPath<
  T extends Policy,
  PolicyKey extends Extract<keyof T, string> = Extract<keyof T, string>,
> =
  | PolicyKey
  | {
      [K in PolicyKey]: `${K}.${Extract<keyof T[K]['actions'], string>}`;
    }[PolicyKey];

export const getPolicyStatement = <T extends Policy>(policies: T) => {
  return Object.entries(policies).reduce(
    (acc, [key, value]) => {
      acc[key as keyof T] = Object.keys(value.actions);

      return acc;
    },
    {} as Record<keyof T, string[]>
  );
};

export const getPolicyDescription = <T extends Policy, P extends PolicyPath<T>>(
  policies: T,
  path: P
) => {
  const [policyKey, actionKey] = path.split('.');

  const policy = policies[policyKey];

  return actionKey
    ? policy?.actions?.[actionKey]?.description
    : policy?.description;
};
