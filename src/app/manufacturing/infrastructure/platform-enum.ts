/**
 * Converts an enum value of the DoofPlus Platform (IN_PROGRESS) to the value the views use (in-progress).
 * @param value - Enum value answered by the platform.
 * @returns The value in kebab-case, or an empty string when there is no value.
 */
export const fromPlatformEnum = (value: string | null | undefined): string =>
  value ? value.toLowerCase().replace(/_/g, '-') : '';
