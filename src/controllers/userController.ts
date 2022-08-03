import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'


import { uploadFile, getFileStream } from '/home/juanma/Documents/projects/video-sharing-app/s3'
import * as fs from 'fs'
import * as util from 'util'

const unlinkFile = util.promisify(fs.unlink)
const prisma = new PrismaClient()

const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    console.log(users);
    return res.json(users);
}

const getPfp = async (req: Request, res: Response) => {
    console.log(req.params)
    const key = req.params.key
    const readStream = getFileStream(key)
    readStream.on('error', function (error) {
        console.log(error.message)
        return res.status(403).send({ message: error.message })
    })
    readStream.pipe(res)
}

const uploadPfp = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10)
    const file = req.file
    console.log(file)
    try {
        const result = await uploadFile(file)
        console.log(result)
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                pfp: result.Key,
            }
        })
        await unlinkFile(file.path)
        res.status(200).send({ imagePath: `/avatars/${result.Key}` })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

export {
    getUsers,
    getPfp,
    uploadPfp,
}