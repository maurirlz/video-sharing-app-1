import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'
import { uploadFile, getFileStream, removeFile } from '../../s3'
import { unlink } from 'fs'
import util from 'util'
import sharp from 'sharp'

const unlinkFile = util.promisify(unlink)
const { user: userModel, follow: followModel } = new PrismaClient()

const getUserInfo = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id) // 500
    try {
        const user = await userModel.findUnique({
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
        const user = await userModel.findFirstOrThrow({
            where: {
                name: username
            }
        })
        delete user.email
        delete user.password
        res
            .status(200)
            .send(user)
    } catch (error) {
        res
            .status(404)
            .send({ message: error.message })
    }
}

const getFollowedUsers = async (req: Request, res: Response) => {
    const userId = Number(req.params.id)
    try {

        const followedUsers = await followModel.findMany({
            where: {
                userId: userId
            }
        })

        return res
            .status(200)
            .send(followedUsers)
    } catch (error) {
        return res
            .status(404)
            .send(error.message)
    }
}

const followUser = async (req: Request, res: Response) => {
    const userId = Number(req.params.id)
    const followedUserId = Number(req.params.followId)

    const user = await userModel.findUnique({
        where: {
            id: userId,
        }, include: {
            following: true
        }
    })

    const followedUser = await userModel.findUnique({
        where: {
            id: followedUserId,
        }
    })

    if ([user, followedUser].some((u) => !u)) { // user, followedUser
        return res.status(404).send({ message: 'user not found' })
    }

    const { id } = user
        .following
        .find(({ followedUserId }) => followedUserId === followedUser.id);

    if (!id) {
        try {
            await followModel.delete({
                where: {
                   id
                }
            })
            return res
                .status(204)
                .send()// no content
        } catch (error) {
            return res.status(500).send({ message: error.message })
        }
    }

    try {
        const follow = await followModel.create({
            data: {
                userId,
                followedUserId,
                followedUsername: followedUser.name,
                followedUserPfp: followedUser.pfp,
            }
        })

        res
            .status(204)
            .send();
    } catch (error) {
        res
            .status(500)
            .send({ message: error.message })
    }
}

const getPfp = async (req: Request, res: Response) => {
    const key = req.params.key
    const readStream = getFileStream(key)


    readStream.on('error', (e) => res
        .status(500)
        .send({ msg: 'some msg'}))
    // readStream.on('error', function (error) {
    //     return res.status(403).send({ message: error.message })
    // })

    readStream.pipe(res)
}

const uploadPfp = async (req: Request, res: Response) => {
    const userId = Number(req.params.id)
    const file = req.file

    const user = await userModel.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        return res
            .status(404)
            .send({ message: 'user not found' })
    }

    const width = 200;
    const height = 200;
    await sharp(`uploads/${file.filename}`)
        .resize(width,  height)
        .toFile(`uploads/${file.filename}rs`)

    try {
        const result = await uploadFile(`${file.filename}rs`)

        await unlinkFile(`uploads/${file.filename}rs`)
        await unlinkFile(file.path)

        const updatedUser = await userModel.update({
            where: {
                id: userId,
            },
            data: {
                pfp: result.Key,
            }
        })

        await removeFile(user.pfp)

        res
            .status(200)
            .send({ imagePath: `/ avatars / ${result.Key}` })
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