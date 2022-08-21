import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { uploadFile, removeFile } from '/home/juanma/Documents/projects/video-sharing-app/s3'
import * as fs from 'fs'
import * as util from 'util'
import * as sharp from 'sharp'

const unlinkFile = util.promisify(fs.unlink)
const prisma = new PrismaClient()


export const getPosts = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId
            }
        })
        return res.status(200).send(posts)
    } catch (error) {
        return res.status(500).send(error.message)
    }

}

export const createPost = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const content = req.body.content
    const file = req.file

    console.log(content)
    console.log(file)

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }
    })

    if (!user) {
        return res.status(500).send({ message: 'user not found' })
    }

    //post w/ only text

    if (!file) {
        try {
            const post = await prisma.post.create({
                data: {
                    authorId: userId,
                    content: content,
                }
            })
            return res.status(200).send()
        } catch (error) {
            return res.status(500).send({ message: 'couldnt create a new post' })
        }
    }

    //post w/ image

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
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


    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm') {
        try {
            const result = await uploadFile(`${file.filename}`)

            await unlinkFile(file.path)

            const post = await prisma.post.create({
                data: {
                    authorId: userId,
                    content: content,
                    video: result.Key
                }
            })

            res.status(200).send({ imagePath: `/ postVideo / ${result.Key}` })
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    }

}

export const deletePost = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId)
    const postId = parseInt(req.params.postId)

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        const post = await prisma.post.findUnique({
            where: {
                id: postId,
            }
        })

        if (!post.img && !post.video) {
            await prisma.post.delete({
                where: {
                    id: postId
                }
            })
            return res.status(200).send()
        }

        const result = post.img ? await removeFile(post.img) : await removeFile(post.video)

        console.log(result)

        await prisma.post.delete({
            where: {
                id: postId
            }
        })

        return res.status(200).send()

    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}