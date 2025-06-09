import JWT from 'jsonwebtoken'
import { env } from '~/config/environment'

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, {algorithm: 'HS256', expiresIn: tokenLife});
  } catch (error) {
    throw new Error(error);
    
  }
}

const verifyToken = async (token, secretSignature, ) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(error);
    
  }
}

export const ACCESS_TOKEN_SECRET_SIGNATURE = env.ACCESS_TOKEN_SECRET_SIGNATURE
export const REFRESH_TOKEN_SECRET_SIGNATURE = env.REFRESH_TOKEN_SECRET_SIGNATURE

export const JwtProvider = {
  generateToken,
  verifyToken
}