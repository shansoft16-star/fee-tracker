import { CustomerDetailPage } from "@/pages/CustomerDetailPage";
import { CustomerFormPage } from "@/pages/CustomerFormPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { DashboardPage } from "@/pages/DashboardPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

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

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
