import { Request, Response } from 'express';
import * as express from 'express'
import { getUsers, getPfp, uploadPfp } from '../controllers/userController'
import { verifyToken } from '../middlewares/auth'
import * as multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const userRouter = express.Router();

userRouter.get("/all", getUsers);
userRouter.get("/avatars/:key", getPfp);
userRouter.post("/avatars/:id", upload.single('image'), uploadPfp);

export { userRouter }