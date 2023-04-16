const catchAsync = require('./catchAsync');
const Product = require('./../model/porductModel');
const FilterApi = require('./../utils/filterAPI');

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id });

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

/**
 * Middleware function used query the database for produts, and send the respomnse as JSON to the client
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const expressQuery = { ...req.query };
  console.log(expressQuery);
  const mongooseQuery = Product.find();

  const filteredQuery = new FilterApi(mongooseQuery, expressQuery).filter().sort().project().paginate();
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

/**
 * Middleware function used to create a new product document entry based on the user information passed into the body request object.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.createProduct = catchAsync(async (req, res, next) => {
  //1 Create and insert into the Db de mongodb document
  const productDocument = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { productDocument },
  });
});

/**
 * Middleware function used to delete  product document entry based on a user id
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOneAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: product,
  });
});

/**
 * Middleware function used to update product document entry based on a user id and its field passed into the request body.
 * @param {object} req expects a request object
 * @param {object} res expects a response object
 * @param {function} next expects a function that will be used to  navigate to the next middleware
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    //returned document will be the newly updated one
    new: true,
    //each time a document is updated, the validators within the schema will run again
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});
