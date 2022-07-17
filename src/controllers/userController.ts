import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

const argon2 = require('argon2');
const express = require('express');
const app = express();

const prisma = new PrismaClient()

const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    console.log(users);
    return res.json(users);
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
        const hashedPassword = await argon2.hash(password)
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

module.exports = {
    getUsers,
    register,
}