import { v2 as cloudinary } from "cloudinary";

export function initCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return cloudinary;
}

export async function uploadImageBuffer({ buffer, filename, mimetype }) {
  const cloud = initCloudinary();
  const folder = process.env.CLOUDINARY_FOLDER || "comp3133_assignment1";

  // Upload from buffer using an upload_stream
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}_${sanitizeName(filename)}`,
        overwrite: true
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

function sanitizeName(name) {
  return String(name || "photo")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-\.]/g, "");
}