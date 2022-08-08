import { Request, Response } from 'express';
import * as express from 'express'
import { createPost, followUser, getFollowedUsers, getPfp, getPosts, getUserInfo, uploadPfp } from '../controllers/userController'
import { verifyToken } from '../middlewares/auth'
import * as multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const userRouter = express.Router();

userRouter.get("/avatars/:key", getPfp);
userRouter.get("/posts/:id", getPosts);
userRouter.get("/following/:id", getFollowedUsers);
userRouter.get("/:id", getUserInfo);
userRouter.post("/follow/:id/:followId", followUser);
userRouter.post("/avatars/:id", upload.single('image'), uploadPfp);
userRouter.post("/create/:id", upload.single('image'), createPost);

export { userRouter }