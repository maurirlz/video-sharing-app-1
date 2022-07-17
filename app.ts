import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
const express = require('express')

const prisma = new PrismaClient()

const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//link to routes
app.use("/users", require("./src/routes/user"));

app.get('/', function (req: Request, res: Response) {
    return res.json({ message: 'Hello World!' });
})

app.listen(process.env.APP_PORT)