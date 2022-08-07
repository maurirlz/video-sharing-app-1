import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'

import path from 'path'
import { uploadFile, getFileStream } from '/home/juanma/Documents/projects/video-sharing-app/s3'
import * as fs from 'fs'
import * as util from 'util'
import * as sharp from 'sharp'
import { PrismaClientRustPanicError } from '@prisma/client/runtime';

const unlinkFile = util.promisify(fs.unlink)
const prisma = new PrismaClient()

const getPosts = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    const posts = await prisma.post.findMany({
        where: {
            authorId: userId
        }
    })
    return res.status(200).send(posts)
}

const createPost = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    const content = req.body.content
    const file = req.file

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    })

    if (!user) {
        return res.status(500).send({ message: 'user not found' })
    }

    await sharp(`uploads/${file.filename}`)
        .resize(600, 600)
        .toFile(`uploads/${file.filename}rs`)

    try {
        const result = await uploadFile(`${file.filename}rs`)

        await unlinkFile(`uploads/${file.filename}rs`)
        await unlinkFile(file.path)

        const post = await prisma.post.create({
            data: {
                authorId: userId,
                content: content,
                img: result.Key
            }
        })

        res.status(200).send({ imagePath: `/ postImg / ${result.Key}` })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }

}

const getPfp = async (req: Request, res: Response) => {

    const key = req.params.key
    const readStream = getFileStream(key)

    readStream.on('error', function (error) {
        return res.status(403).send({ message: error.message })
    })

    readStream.pipe(res)
}

const uploadPfp = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    const file = req.file

    await sharp(`uploads/${file.filename}`)
        .resize(200, 200)
        .toFile(`uploads/${file.filename}rs`)

    try {
        const result = await uploadFile(`${file.filename}rs`)

        await unlinkFile(`uploads/${file.filename}rs`)
        await unlinkFile(file.path)

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                pfp: result.Key,
            }
        })

        res.status(200).send({ imagePath: `/ avatars / ${result.Key}` })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

// without resizing
// const uploadPfp = async (req: Request, res: Response) => {
//     const userId = parseInt(req.params.id, 10)
//     const file = req.file
//     console.log(file)
//     try {
//         const result = await uploadFile(file)
//         console.log(result)
//         const updatedUser = await prisma.user.update({
//             where: {
//                 id: userId,
//             },
//             data: {
//                 pfp: result.Key,
//             }
//         })
//         await unlinkFile(file.path)
//         res.status(200).send({ imagePath: `/avatars/${result.Key}` })
//     } catch (error) {
//         res.status(500).send({ message: error.message })
//     }
// }

export {
    getPfp,
    getPosts,
    uploadPfp,
    createPost,
}