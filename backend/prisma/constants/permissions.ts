export const MODULES = [
  "organization", "user", "contact", "lead", "opportunity",
  "quotation", "product", "category", "manufacturer",
  "installation", "warranty", "amc", "service-request","address"
] as const;

export const ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
] as const;

export const PERMISSIONS = MODULES.flatMap((module) =>
  ACTIONS.map((action) => `${module}:${action}`)
);