import * as express from 'express'
import { createPost, getPosts, deletePost } from '../controllers/postController'
import { verifyToken } from '../middlewares/auth'
import * as multer from 'multer'

const upload = multer({ dest: 'uploads/' })
const postRouter = express.Router();

postRouter.get("/get/:userId", getPosts);
postRouter.post("/create/:userId", upload.single('file'), createPost);
postRouter.delete("/delete/:userId/:postId", deletePost);

export { postRouter }