export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_EXECUTIVE: "SALES_EXECUTIVE",
  SURVEY_ENGINEER: "SURVEY_ENGINEER",
  INSTALLATION_ENGINEER: "INSTALLATION_ENGINEER",
  SERVICE_ENGINEER: "SERVICE_ENGINEER",
} as const;

export const ROLE_LIST = [
  {
    name: ROLES.SUPER_ADMIN,
    description: "System Super Administrator",
  },
  {
    name: ROLES.ADMIN,
    description: "Organization Administrator",
  },
  {
    name: ROLES.SALES_MANAGER,
    description: "Manages sales team",
  },
  {
    name: ROLES.SALES_EXECUTIVE,
    description: "Handles leads and quotations",
  },
  {
    name: ROLES.SURVEY_ENGINEER,
    description: "Performs site surveys",
  },
  {
    name: ROLES.INSTALLATION_ENGINEER,
    description: "Handles installations",
  },
  {
    name: ROLES.SERVICE_ENGINEER,
    description: "Handles warranty and service requests",
  },
] as const;