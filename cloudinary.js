// @ts-nocheck
require("dotenv/config")
const cloudinary = require("cloudinary");
cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

exports.uploads = (file, folder) => {
  return new Promise (resolve => {
    cloudinary.uploader.upload(file,(result) => {
      resolve(result.url)
    }, {
      resource_type: "auto",
      folder: folder,
      quality: "70:qmax_70"
    })
  })
}