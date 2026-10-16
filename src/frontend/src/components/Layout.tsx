import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Plus, Users } from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (path) => path === "/",
  },
  {
    to: "/customers",
    label: "Customers",
    icon: Users,
    match: (path) => path === "/customers" || /^\/customers\/[^/]+$/.test(path),
  },
  {
    to: "/customers/new",
    label: "Add",
    icon: Plus,
    match: (path) => path === "/customers/new",
  },
];

interface LayoutProps {
  title: string;
  children: ReactNode;
  /** Optional element rendered on the right of the app bar (e.g. an add button). */
  action?: ReactNode;
  /** Hide the bottom navigation for focused flows such as full-screen forms. */
  hideNav?: boolean;
}

/**
 * Mobile-first app shell: pine top app bar, scrollable content, fixed bottom
 * navigation with safe-area padding.
 */
export function Layout({
  title,
  children,
  action,
  hideNav = false,
}: LayoutProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header
        data-ocid="app.header"
        className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-subtle"
      >
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <h1 className="truncate font-display text-lg font-semibold tracking-tight">
            {title}
          </h1>
          {action ? (
            <div className="flex shrink-0 items-center gap-2">{action}</div>
          ) : null}
        </div>
      </header>

      <main
        data-ocid="app.content"
        className={cn(
          "mx-auto w-full max-w-2xl flex-1 px-4 py-5",
          hideNav ? "pb-8" : "pb-28",
        )}
      >
        {children}
      </main>

      {hideNav ? null : (
        <nav
          data-ocid="app.nav"
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card shadow-nav"
        >
          <div className="safe-bottom mx-auto flex w-full max-w-2xl items-stretch justify-around px-2">
            {NAV_ITEMS.map((item) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={`nav.${item.label.toLowerCase()}.link`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap-target flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-smooth",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
