import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { verify, hash } from 'argon2'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import { resolve } from 'path';

const app = express();

const prisma = new PrismaClient()

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    })

    if (!user)
        return res.status(500).send({ message: 'user not found' })

    try {
        if (await verify(user.password, password)) {
            delete user.password;
            jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '300s' }, (err: Error, token: string) => {
                res.json({
                    token,
                    user,
                })
                return;
            }
            )
        } else {
            return res.status(500).send({ message: 'wrong password' })
        }
    } catch (err) {
        return res.status(500).send(err.message)
    }

}

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(422).send({ message: 'Name, email or password should not be null' });
    }

    const userExists = await prisma.user.findUnique({
        where: {
            email: email,
        },
    })

    if (userExists)
        return res.status(422).send({ message: 'Email is already taken by another user' });

    try {
        const hashedPassword = await hash(password)
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            }
        })
        return res.status(200).send()
    } catch (err) {
        return res.status(422).send({ message: 'hashing password failed' + err })
    }
}

const authorize = async (req: Request, res: Response) => {
    return res.status(200).send()
}

export {
    login,
    register,
    authorize,
}