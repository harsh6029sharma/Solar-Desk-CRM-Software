export type JwtAccessPayload = {
    userId: string;
    orgId: string;
    roles: string[];
    permissions: string[];
    jti: string;
};

export type JwtRefreshPayload = {
    userId: string;
    jti: string;
};