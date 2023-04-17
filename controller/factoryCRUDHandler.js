//Code inspired from https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/
const catchAsync = require('./catchAsync');
const FilterApi = require('../utils/filterAPI');
const OperationalError = require('./../utils/operationalError');
const { resizeAndStoreImage } = require('./../utils/imageProcessor');
/**
 * Middleware function used query the database for a document based on a provided _id and its data Model object,
 * Sends the result back to the client.
 * @function catchAsync used to catch and propagate further any occurring error
 * @param {object} Model expects a Mongoose Model built on top a db schema.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.getDocument = (Model) => {
  return catchAsync(async (req, res, next) => {
    //query the db for the entry based in the given _id
    const document = await Model.findById({ _id: req.params.id });
    //the query has not returned anything
    if (!document) {
      next(new OperationalError('No such document with found, wrong ID'));
    }
    //user feedback
    res.status(200).json({
      status: 'success',
      data: { document },
    });
  });
};

/**
 * Middleware function used query the database for a documents based on a provided Model data object,
 * Sends the result back to the client.
 * @class Filter Api class that will allow users to filter data by passing query string into the url like. (Filtering,Sorting,Projecting,Pagonating).
 * @function catchAsync used to catch and propagate further any occurring error.
 * @param {object} Model expects a Mongoose Model built on top a db schema.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.getAllDocuments = (Model) => {
  return catchAsync(async (req, res, next) => {
    //query parameters coming from the client as a requset object on the body
    const expressQuery = { ...req.query };
    //mongoose query promise used to build up all the api features.
    const mongooseQuery = Model.find();
    const filteredQuery = new FilterApi(mongooseQuery, expressQuery).filter().sort().project().paginate();
    //filtered,sorted,projected, and paginated results
    const resultDocuments = await filteredQuery.mongooseQuery;
    FilterApi;
    res.status(200).json({
      status: 'success',
      results: resultDocuments.length,
      data: {
        resultDocuments,
      },
    });
  });
};

/**
 * Middleware function used to create a new document entry based on the user information passed into the body request object  by the user.
 * If the middleaware expect an image the image will be resized and stored into the newly created imgUrl
 * Sends the result back to the client.
 * @function catchAsync used to catch and propagate further any occurring error.
 * @param {object} Model expects a Mongoose Model built on top a db schema.
 * @param {string} storedFolder expects a the public/images/{storedFolder} where the image is stored
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.createDocument = (Model, storedFolder = null) => {
  return catchAsync(async (req, res, next) => {
    //1 If the create request has and expects an image
    if (storedFolder && req.files.image) {
      //set the imgUrl on body object, used later for creating and inserting the doc into db and for image resizing and storing
      req.body.imgUrl = `public/images/${storedFolder}/${Date.now()}.jpg`;
    }
    //2 Create and insert into the Db de mongodb document
    const document = await Model.create(req.body);

    //3 Upload and resize the image
    if (document && req.files.image && storedFolder) {
      resizeAndStoreImage(req.files.image[0].buffer, req.body.imgUrl, 500);
    }
    //4 Let the user know the operation had succeded
    res.status(201).json({
      status: 'success',
      data: { document },
    });
  });
};

/**
 * Middleware function used to delete  a document entry based on a user id  passed into the body request object by the user.
 * Sends the result back to the client.
 * @function catchAsync used to catch and propagate further any occurring error.
 * @param {object} Model expects a Mongoose Model built on top a db schema.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.deleteDocument = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findOneAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: document,
    });
  });
};

/*
 * Middleware function used to update  a document entry based on a user id  and its field passed into the request body by the user.
 * Sends the result back to the client.
 * @function catchAsync used to catch and propagate further any occurring error.
 * @param {object} Model expects a Mongoose Model built on top a db schema.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.updateDocument = (Model) => {
  return catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      //returned document will be the newly updated one
      new: true,
      //each time a document is updated, the validators within the schema will run again
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { document },
    });
  });
};
