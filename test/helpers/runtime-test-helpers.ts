import { vi } from "vitest";

type UUID = `${string}-${string}-${string}-${string}-${string}`;

export function useFixedTime(isoString = "2026-01-01T00:00:00.000Z"): Date {
  const fixedDate = new Date(isoString);
  vi.useFakeTimers();
  vi.setSystemTime(fixedDate);
  return fixedDate;
}

export function mockRandomUUID(
  value: UUID = "11111111-1111-4111-8111-111111111111",
) {
  return vi
    .spyOn(globalThis.crypto, "randomUUID")
    .mockImplementation(() => value);
}
