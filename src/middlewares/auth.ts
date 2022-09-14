import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = parseToken(authHeader)
    if ([authHeader, token].some(a => !a))
        res.status(403).send({ message: 'missing or invalid token' });


    const { JWT_SECRET } = process.env;
    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
            return res
                .status(403)
                .send(err)
        }
        return next();
    })
}

function parseToken(token: string) {
    if (!token.startsWith('Bearer ')) {
        return;
    }

    const [, parsedToken] = token.split(' ')

    return parsedToken
}

export { verifyToken }