export interface JwtPayload {
  username: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
  role: string;
}
