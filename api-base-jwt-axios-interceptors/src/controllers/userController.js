
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'

const MOCK_DATABASE = {
  USER: {
    ID: 'trungquandev-sample-id-12345678',
    EMAIL: 'trungquandev.official@gmail.com',
    PASSWORD: 'trungquandev@123'
  }
}

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      5
      // '1h' // Thời gian sống của access token
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      15
      // '14 days'
    )

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms('14 days'), // Thời gian sống của cookie
      sameSite: 'none'
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms('14 days'), // Thời gian sống của cookie
      sameSite: 'none'
    })

    res.status(StatusCodes.OK).json({ 
      ...userInfo,
      accessToken,
      refreshToken
     })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // Xóa cookie accessToken và refreshToken
    // Use cookie
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    // cách 1 Lấy từ cookie đã đính kèm vào request
    // Use cookie
    const refreshTokenFromCookie = req.cookies?.refreshToken


    // cách 2 từ localStorage phía FE sẽ truyền vào khi gọi API
    const refreshTokenFromLocalStorage = req.body?.refreshToken

    //verify refresh Token
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      // Use cookie
      // refreshTokenFromCookie, //Dùng token từ cookie 
      refreshTokenFromLocalStorage, //Dùng token từ body trong request gửi lên
      REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Lấy thông tin user từ token đã giải mã
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    //Tạo access token mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      5
      // '1h' // Thời gian sống của access token
    )

    // res lại cookie accessToken mới cho trường hợp sử dụng cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: ms('14 days'), // Thời gian sống của cookie
      sameSite: 'none'
    })

    //trả về accessToken mới cho trường hợp sử dụng localStorage


    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: 'Refresh token is invalid or expired!'})
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
