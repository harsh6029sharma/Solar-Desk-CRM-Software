import { PERMISSIONS } from "./permissions";
import { ROLES } from "./roles";

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: PERMISSIONS,

  [ROLES.ADMIN]: PERMISSIONS,

  [ROLES.SALES_MANAGER]: [
    "contact:create",
    "contact:read",
    "contact:update",

    "lead:create",
    "lead:read",
    "lead:update",

    "opportunity:create",
    "opportunity:read",
    "opportunity:update",

    "quotation:create",
    "quotation:read",
    "quotation:update",
  ],

  [ROLES.SALES_EXECUTIVE]: [
    "contact:create",
    "contact:read",
    "contact:update",

    "lead:create",
    "lead:read",
    "lead:update",

    "quotation:create",
    "quotation:read",
  ],

  [ROLES.SURVEY_ENGINEER]: [
    "opportunity:read",
    "installation:read",
  ],

  [ROLES.INSTALLATION_ENGINEER]: [
    "installation:create",
    "installation:read",
    "installation:update",
  ],

  [ROLES.SERVICE_ENGINEER]: [
    "service-request:create",
    "service-request:read",
    "service-request:update",

    "warranty:read",

    "amc:read",
  ],
} as const;