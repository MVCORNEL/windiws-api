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
