import * as express from 'express'
import { followUser, getFollowedUsers, getPfp, getUserInfo, searchUser, uploadPfp } from '../controllers/userController'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const userRouter = express.Router();

userRouter.get("/avatars/:key", getPfp);
userRouter.get("/following/:id", getFollowedUsers);
userRouter.get("/:id", getUserInfo);
userRouter.get("/find/:username", searchUser);
userRouter.post("/follow/:id/:followId", followUser);
userRouter.post("/avatars/:id", upload.single('image'), uploadPfp);

export { userRouter }