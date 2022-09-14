import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { verify, hash } from 'argon2'
import * as jwt from 'jsonwebtoken'
const prisma = new PrismaClient()

const login = async (req: Request, res: Response) => {
    let status;
    let jsonMessage;
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    })

    if (!user)
        return res
            .status(404)
            .send({ message: 'user not found' })

    try {
        if (await verify(user.password, password)) {
            const config = { expiresIn : '300s' };
            delete user.password;
            const cb = (err: Error, token: string) => {
                jsonMessage = { token, user }
                res.json(jsonMessage)
            };
            jwt.sign({ user }, process.env.JWT_SECRET, config, cb)
        } else {
            status = 401;
            jsonMessage = { message: 'wrong password '}
            res
                .status(status)
                .send(jsonMessage)
        }
    } catch (err) {
        status = 500;
        res
            .status(status)
            .send(err.message)
    }

}

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if ([name, email, password].some((arg) => !arg)) { //!name, !email !password
        return res
            .status(400)
            .send({ message: 'Name, email or password should not be null' });
    }

    const userExists = await prisma
        .user
        .findUnique({
        where: {
            email: email,
        }
    })

    if (userExists)
        return res
            .status(409)
            .send({ message: 'Email is already taken by another user' });

    try {
        const hashedPassword = await hash(password)
        await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            }
        })
        return res.status(200).send({
            msg: "Successfully created",
            name,
            email
        })
    } catch (err) {
        return res
            .status(500)
            .send({ message: 'hashing password failed' + err })
    }
}

const authorize = async (req: Request, res: Response) => {
    return res
        .status(200)
        .send()
}

export {
    login,
    register,
    authorize,
}