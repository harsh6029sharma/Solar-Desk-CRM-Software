export interface JwtAccessPayload {
  userId: string;
  orgId: string;
  roles: string[];
  permissions: string[];
}

export interface JwtRefreshPayload {
  userId: string;
}