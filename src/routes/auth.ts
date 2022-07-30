import * as express from 'express'
import { login, register, authorize } from '../auth/auth'
import { verifyToken } from '../middlewares/auth'

const authRouter = express.Router();

authRouter.post("/login", login)
authRouter.post("/register", register)
authRouter.get("/authorize", verifyToken, authorize)

export { authRouter }