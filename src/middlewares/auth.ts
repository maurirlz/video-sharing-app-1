import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import { resolve } from 'path';
import * as jwt from 'jsonwebtoken';

function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) { return res.status(401).send({ message: 'missing token' }) }

    const token = parseToken(authHeader)

    if (!token) { return res.status(401).send({ message: 'invalid token' }) }

    jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'something',
                authData,
            })
        }
    })

    next()
}

function parseToken(token: string) {
    if (!token.startsWith('Bearer ')) {
        return
    }

    const [_, parsedToken] = token.split(' ')
    console.log(parsedToken)

    return parsedToken
}

export { verifyToken }