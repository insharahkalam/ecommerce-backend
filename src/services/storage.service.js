import { v2 as cloudinary } from 'cloudinary'
import dotenv from "dotenv"
dotenv.config()
console.log(process.env.CLOUD_NAME, process.env.API_KEY, process.env.API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const uploadImg = async (file) => {
    console.log(file, "===>cloud check file");

    const fileName = `Posts-${file.originalname.split(".")[0]}_${Date.now()}`
    console.log(fileName, "=========>check filename");

    const uploadStreme = new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({
            public_id: fileName,
            folder: "products",
            overwrite: false,
            unique_filename: true,
            use_filename: true,
            resource_type: 'auto'
        }, (error, result) => {
            if (error) {
                console.log(error, "uploading img error");
                return reject(error)
            }
            if (result) {
                console.log(result, "upload results");
                resolve(result)
            }

        })
        upload.end(file.buffer)
    })
    console.log(uploadStreme, 'streme check');
    return uploadStreme
}

const deleteImg = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type: "image"
        });
        return result
    } catch (error) {
        console.log('error in delelting======>', error);
    }
}

const updateImg = async (pubId, file) => {
    try {
        const delRes = await cloudinary.uploader.destroy(pubId, {
            resource_type: "image"
        });
        console.log(delRes, "old prod deleted");

        const fileName = `Posts-${file.originalname.split(".")[0]}_${Date.now()}`
        console.log(fileName, "=========>check new filename");

        const updateStreme = new Promise((resolve, reject) => {
            const update = cloudinary.uploader.upload_stream({
                public_id: fileName,
                folder: "products",
                overwrite: false,
                unique_filename: true,
                use_filename: true,
                resource_type: 'auto'
            }, (error, result) => {
                if (error) {
                    console.log(error, "uploading img error");
                    return reject(error)
                }
                if (result) {
                    console.log(result, "upload results");
                    resolve(result)
                }

            })
            update.end(file.buffer)
        })
        console.log(updateStreme, 'streme check');
        return updateStreme

    } catch (error) {
        console.log('error in updating product======>', error);
    }
}


export { uploadImg, deleteImg, updateImg }