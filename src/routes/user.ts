import { Request, Response } from 'express';
import * as express from 'express'
import { getUsers } from '../controllers/userController'
import { verifyToken } from '../middlewares/auth'

const userRouter = express.Router();

userRouter.get("/all", verifyToken, (req: Request, res: Response) => { });

export { userRouter }