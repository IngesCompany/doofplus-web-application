/**
 * Converts an enum value of the DoofPlus Platform (IN_REVIEW) to the value the views use (in-review).
 * @param value - Enum value answered by the platform.
 * @returns The value in kebab-case, or an empty string when there is no value.
 */
export const fromPlatformEnum = (value: unknown): string =>
  typeof value === 'string' && value ? value.toLowerCase().replace(/_/g, '-') : '';

/**
 * Prepares a Quality & Compliance resource of the DoofPlus Platform for its entity: the enum fields go from
 * UPPER_SNAKE_CASE to kebab-case and the empty values (dates, texts) come as empty text instead of null.
 * @param resource - Resource answered by the platform.
 * @param enumFields - Fields that hold an enum value.
 * @returns The resource with the values the views use.
 */
export const fromPlatform = <T extends object>(resource: T, enumFields: (keyof T)[] = []): T =>
  Object.fromEntries(Object.entries(resource).map(([field, value]) => [
    field,
    enumFields.includes(field as keyof T) ? fromPlatformEnum(value) : value === null ? '' : value
  ])) as T;
