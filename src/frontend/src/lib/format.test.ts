import {
  formatMobile,
  formatMoney,
  initials,
  isValidMobile,
  minorUnitsToInput,
  normalizeMobile,
  parseCustomerId,
  parseMoneyToMinorUnits,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("money formatting", () => {
  it("formats integer minor units as rupees", () => {
    expect(formatMoney(125050n)).toBe("₹1,250.50");
    expect(formatMoney(0n)).toBe("₹0.00");
  });

  it("parses a typed rupee amount into minor units", () => {
    expect(parseMoneyToMinorUnits("1250.50")).toBe(125050n);
    expect(parseMoneyToMinorUnits("0")).toBe(0n);
    expect(parseMoneyToMinorUnits("")).toBe(0n);
    expect(parseMoneyToMinorUnits("not a number")).toBe(0n);
  });

  it("round-trips minor units back to an editable string", () => {
    expect(minorUnitsToInput(125050n)).toBe("1250.50");
    expect(minorUnitsToInput(0n)).toBe("0.00");
  });
});

describe("mobile helpers", () => {
  it("keeps only digits and plus signs", () => {
    expect(normalizeMobile("98765-43210")).toBe("9876543210");
    expect(normalizeMobile("+91 98765 43210")).toBe("+919876543210");
  });

  it("groups a ten-digit number for display", () => {
    expect(formatMobile("9876543210")).toBe("98765 43210");
    expect(formatMobile("123")).toBe("123");
  });

  it("accepts plausible phone lengths only", () => {
    expect(isValidMobile("9876543210")).toBe(true);
    expect(isValidMobile("123456")).toBe(false);
    expect(isValidMobile("1234567890123456")).toBe(false);
  });
});

describe("customer id parsing", () => {
  it("parses a numeric id", () => {
    expect(parseCustomerId("42")).toBe(42n);
  });

  it("returns undefined for missing or non-numeric ids", () => {
    expect(parseCustomerId(undefined)).toBeUndefined();
    expect(parseCustomerId("abc")).toBeUndefined();
    expect(parseCustomerId("")).toBeUndefined();
  });
});

describe("initials", () => {
  it("derives initials from a full name", () => {
    expect(initials("Asha Rao")).toBe("AR");
    expect(initials("Madonna")).toBe("MA");
    expect(initials("   ")).toBe("?");
  });
});
