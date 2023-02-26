const cloudinary = require("cloudinary");
const router = require("express").Router();
require("dotenv").config();

// setup cloudinary api credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

router.delete("/:public_id", async (req, res) => {
  //definition for DELETE method that accepts public ID parameter in the request URL
  const { public_id } = req.params;
  try {
    await cloudinary.uploader.destroy(public_id); //uses the cloudinary package to destroy/delete the image with the provided public_id.
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
