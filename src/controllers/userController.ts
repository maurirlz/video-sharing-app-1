import e, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { uploadFile, getFileStream, removeFile } from '/home/juanma/Documents/projects/video-sharing-app/s3'
import * as fs from 'fs'
import * as util from 'util'
import * as sharp from 'sharp'

const unlinkFile = util.promisify(fs.unlink)
const prisma = new PrismaClient()

const getUserInfo = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        delete user.email
        delete user.password
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const searchUser = async (req: Request, res: Response) => {
    const username = req.params.username
    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                name: username
            }
        })
        delete user.email
        delete user.password
        res.status(200).send(user)
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

const getFollowedUsers = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    try {

        const followedUsers = await prisma.follow.findMany({
            where: {
                userId: userId
            }
        })

        return res.status(200).send(followedUsers)

    } catch (error) {
        return res.status(500).send(error.message)
    }
}

const followUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id)
    const followedUserId = parseInt(req.params.followId)

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        }, include: {
            following: true
        }
    })

    const followedUser = await prisma.user.findUnique({
        where: {
            id: followedUserId,
        }
    })

    if (!user || !followedUser) {
        return res.status(500).send({ message: 'user not found' })
    }

    const isFollowing = user.following.find(e => e.followedUserId === followedUser.id)

    console.log(isFollowing)

    if (isFollowing) {
        try {
            await prisma.follow.delete({
                where: {
                    id: isFollowing.id
                }
            })
            return res.status(200).send({ message: 'user unfollowed' })
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    }

    console.log(user)
    console.log(followedUser)

    try {
        const follow = await prisma.follow.create({
            data: {
                userId: userId,
                followedUserId: followedUserId,
                followedUsername: followedUser.name,
                followedUserPfp: followedUser.pfp,
            }
        })
        console.log(follow)
        res.status(200).send({ message: 'user followed' })
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

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res.status(500).send({ message: 'user not found' })
    }

    await sharp(`uploads/${file.filename}`)
        .resize(200, 200)
        .toFile(`uploads/${file.filename}rs`)

    try {
        const result = await uploadFile(`${file.filename}rs`)

        await unlinkFile(`uploads/${file.filename}rs`)
        await unlinkFile(file.path)

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                pfp: result.Key,
            }
        })

        await removeFile(user.pfp)

        res.status(200).send({ imagePath: `/ avatars / ${result.Key}` })
    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}

export {
    getPfp,
    getUserInfo,
    uploadPfp,
    getFollowedUsers,
    followUser,
    searchUser
}