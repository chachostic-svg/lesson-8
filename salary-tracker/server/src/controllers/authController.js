import * as authService from '../services/authService.js'

// Регистрация нового пользователя
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body

    const result = await authService.register(email, password, name)

    res.status(201).json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

// Вход пользователя
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const result = await authService.login(email, password)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

// Получить информацию о текущем пользователе (по токену)
export async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.userId)

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}