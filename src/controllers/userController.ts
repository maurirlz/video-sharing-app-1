import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import * as express from 'express'
import jwt from 'jsonwebtoken'

const app = express();

const prisma = new PrismaClient()

const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    console.log(users);
    return res.json(users);
}

export {
    getUsers,
}