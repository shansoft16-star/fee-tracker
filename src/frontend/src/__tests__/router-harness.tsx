import { CustomerDetailPage } from "@/pages/CustomerDetailPage";
import { CustomerFormPage } from "@/pages/CustomerFormPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { createTestQueryClient } from "./test-utils";

/**
 * Build a router mirroring the app's real route tree, backed by an in-memory
 * history so a test can start at any URL and assert on navigation.
 */
export function createTestRouter(initialUrl = "/") {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: DashboardPage,
  });

  const customersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/customers",
    validateSearch: (search: Record<string, unknown>) => {
      const result: {
        q?: string;
        sort?: "name" | "total" | "due";
        duesOnly?: boolean;
      } = {};
      if (typeof search.q === "string") result.q = search.q;
      if (
        search.sort === "name" ||
        search.sort === "total" ||
        search.sort === "due"
      ) {
        result.sort = search.sort;
      }
      if (search.duesOnly === true || search.duesOnly === "true") {
        result.duesOnly = true;
      }
      return result;
    },
    component: CustomersPage,
  });

  const newCustomerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/customers/new",
    component: CustomerFormPage,
  });

  const customerDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/customers/$id",
    component: CustomerDetailPage,
  });

  const editCustomerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/customers/$id/edit",
    component: CustomerFormPage,
  });

  const routeTree = rootRoute.addChildren([
    dashboardRoute,
    customersRoute,
    newCustomerRoute,
    customerDetailRoute,
    editCustomerRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
  });
}

/** Render the app's route tree at `initialUrl` inside a query provider. */
export function renderApp(
  initialUrl = "/",
  queryClient: QueryClient = createTestQueryClient(),
) {
  const router = createTestRouter(initialUrl);
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  const result = render(<RouterProvider router={router} />, {
    wrapper: Wrapper,
  });
  return { ...result, queryClient, router };
}
