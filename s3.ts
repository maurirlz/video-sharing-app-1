import * as AWS from 'aws-sdk'
import 'dotenv/config'
import * as fs from 'fs'

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
})

//upload to s3

const uploadFile = (file: any) => {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    }

    return s3.upload(uploadParams).promise()
}

// dl from s3
const getFileStream = (fileKey: string) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }
    
    return s3.getObject(downloadParams).createReadStream()  
}

export {
    uploadFile,
    getFileStream
}