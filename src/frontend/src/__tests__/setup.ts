import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose stable `data-ocid` markers; use them as the
// test-id attribute so semantic queries can fall back to them when needed.
configure({ testIdAttribute: "data-ocid" });

// `globals: false` means RTL's automatic cleanup is not registered, so unmount
// every rendered tree between tests to keep queries scoped to one render.
afterEach(() => {
  cleanup();
});
