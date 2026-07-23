import { settingsMenuItems } from "@/data/settings-menu";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import Link from "next/link";

export default function SettingsLayoutSidebar() {
  const sidebarMenuButtonVariants = cva(
    "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
    {
      variants: {
        variant: {
          default:
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          outline:
            "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
        },
        size: {
          default: "h-9 text-sm",
          sm: "h-8 text-xs",
          lg: "h-14 px-3 text-sm group-data-[collapsible=icon]:p-0!",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    },
  );

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 space-y-6">
        {settingsMenuItems.map((section) => (
          <div key={section.title}>
            <p className="text-muted-foreground mb-1 px-3 text-xs font-semibold tracking-wider uppercase">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.children.map((item) => (
                <Link
                  key={item.title}
                  href={item.path}
                  className={cn(
                    sidebarMenuButtonVariants({ variant: "default" }),
                  )}
                >
                  <item.icon />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
