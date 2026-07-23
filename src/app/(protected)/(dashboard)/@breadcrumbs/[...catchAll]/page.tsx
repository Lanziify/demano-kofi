import DynamicBreadcrumbs from "./breadcrumbs";

type Props = {
  params: Promise<{
    catchAll: string[];
  }>;
};
export default async function BreadcrumbsSlot(props: Props) {
  const { catchAll } = await props.params;

  return <DynamicBreadcrumbs segments={catchAll} />;
}
