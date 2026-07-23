import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbEllipsis,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toSentenceCase } from "@/lib/strings";
import { Coffee } from "lucide-react";
import { Fragment } from "react";

export default function DynamicBreadcrumbs({
  segments,
}: {
  segments: string[];
}) {
  type BreadcrumbItem = {
    label: string;
    href: string;
  };

  type Breadcrumb = BreadcrumbItem | { items: BreadcrumbItem[] };

  const getBreadcrumbs = (): Breadcrumb[] => {
    const resolved = segments.map((segment, i) => ({
      label: segment,
      href: `/${segments.slice(0, i + 1).join("/")}`,
    }));

    if (resolved.length <= 4) {
      return resolved;
    }

    return [
      resolved[0],
      {
        items: resolved.slice(1, -2),
      },
      ...resolved.slice(-2),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* <BreadcrumbItem className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700">
          <Coffee className="size-4" />
          Demano Kofi
        </BreadcrumbItem>
        <BreadcrumbSeparator /> */}
        {breadcrumbs.map((crumb, i) => (
          <Fragment key={i}>
            {"items" in crumb ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost">
                    <BreadcrumbEllipsis />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    {crumb.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <a href={item.href}>{toSentenceCase(item.label)}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : i != breadcrumbs.length - 1 ? (
              <BreadcrumbLink href={crumb.href}>
                {toSentenceCase(crumb.label)}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{toSentenceCase(crumb.label)}</BreadcrumbPage>
              </BreadcrumbItem>
            )}

            {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
