import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
import * as express from 'express'
import 'dotenv/config'
import { userRouter } from './src/routes/user'
import { authRouter } from './src/routes/auth'
import * as cors from 'cors'


const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//link to routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.get('/api', function (req: Request, res: Response) {
    return res.json({ message: 'Hello World!' });
})

app.listen(process.env.APP_PORT)