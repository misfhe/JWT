import { StatusCodes } from 'http-status-codes'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

const isAuthorized = async (req, res, next) => {
  //lấy accessToken từ cookie -- nếu dùng cookie bỏ comment toàn bộ Use cookie
  // Use cookie
  // const accessTokenFromCookie = req.cookies?.accessToken
  // console.log('🚀 ~ isAuthorized ~ accessTokenFromCookie:', accessTokenFromCookie)
  // if (!accessTokenFromCookie) {
  //   res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: (Token not found)' })
  //   return
  // }
  
  //lấy accessToken từ header
  const accessTokenFromHeader = req.headers.authorization
  console.log('🚀 ~ isAuthorized ~ accessTokenFromHeader:', accessTokenFromHeader)

  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: (Token not found)' })
    return
  }

  try{
    const accessTokenDecoded = await JwtProvider.verifyToken(
      //Use cookie
      // accessTokenFromCookie, //Dùng token từ cookie 
      accessTokenFromHeader.substring('Bearer '.length), //Dùng token từ header
      ACCESS_TOKEN_SECRET_SIGNATURE
    )

    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need to refresh Token' })
      return
    }

    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: Please login.' })
  }

}

export const authMiddleware = {
  isAuthorized
}