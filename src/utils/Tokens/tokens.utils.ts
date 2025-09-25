import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export const generateAccessToken = (
  payload: string | object | Buffer,
  secretKey: string,
  options?: SignOptions
): string => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyAccessToken = (
  token: string,
  secretKey: string
): string | JwtPayload => {
  return jwt.verify(token, secretKey);
};
