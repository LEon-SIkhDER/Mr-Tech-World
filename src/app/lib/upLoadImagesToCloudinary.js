import axios from 'axios';
import React from 'react';

const upLoadImagesToCloudinary = async (images) => {
    const imageURLs = await Promise.all(
        images.map(async (file) => {
            const imageData = new FormData()
            imageData.append("file", file)
            imageData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)
            const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, imageData)
            return { url: data.secure_url, publicId: data.public_id }
        })
    )
    return imageURLs

};

export default upLoadImagesToCloudinary;