const multer = require('multer');
const sharp = require('sharp');
const OperationalError = require('./operationalError');

//The storage will be the memory not the disk
const storage = multer.memoryStorage();

/*
 * The function the goal is to test if the uploaded file has an image format, if not throws an operational error.
/* Binds in the memory storage to the middleware.
 */
const uploadInMemory = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    //Doesn't matter if it is a JPEG, PNG or a bitmap or a TIFF, the mimetype will always start with the image
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new OperationalError('Not an image! Please upload only images.', 400), false);
    }
  },
});

/**
 * Handler middleware function that will store the loaded image into the memory on the  request.files object -> files.image[0].buffer object
 */
exports.uploadImageInMemory = uploadInMemory.fields([
  {
    name: 'image',
    maxCount: 1,
  },
]);

/**
 * Function used to resize an image being on the requset object an store it into the designated folder
 * @param {object} bufferedImg expects the buffered imaged into the memory, by the upload in memory method
 * @param {string} imgUrl expects the string that bring to the image locally,
 * @param {number} width the width of the image
 */
exports.resizeAndStoreImage = async (bufferedImg, imgUrl, width) => {
  try {
    await sharp(bufferedImg)
      .resize({
        fit: sharp.fit.contain,
        width: width,
      })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(imgUrl);
  } catch (e) {
    next(new OperationalError('Couldn`t upload the image, please contact the administrator' + e));
  }
};
