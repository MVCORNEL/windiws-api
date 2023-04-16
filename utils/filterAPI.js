/**
 * Filter Api class that will allow users to filter data by passing query string into the url.
 * @param {object} mongooseQuery mongoose query resulted by query the database using find(). Model.find()
 * @param {object} expressQuery Express query is the one that we receive from express by using req.query
 */
class FilterApi {
  constructor(mongooseQuery, expressQuery) {
    this.mongooseQuery = mongooseQuery;
    this.expressQuery = expressQuery;
  }

  /**
   * Method used to filter the mongoose query results based of given query parameters passed into the query string url by the user
   * example/api/v1/products?category=windows
   * example/api/v1/product?price[gte]=10
   * @returns an instance of the current class
   */
  filter() {
    //Create a new object based on the query parameter
    const queryObjectParameters = { ...this.expressQuery };
    //Exclude field that will be used later for pagination, sorting, limit and fields =>
    //otherwise when these field are members of the query object the, querying the DB will return nothing
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObjectParameters[field]);
    //Convert from Object notation to a string, in order to proceed the following replace string operation
    let queryString = JSON.stringify(queryObjectParameters);
    //Advanced querying like gte,gt,lte,lt must have a $ before them, in order that mongodb to recognize them
    //{$category: 'window' , price: {$gte: 10}} WHAT WE NEED
    //{category: 'window', price: {gte: '10'}} WHAT WE HAVE
    //\b assures that only exact matches are replace, and indicate that should test against all possible matches not just the first one
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
    return this;
  }

  /**
   * Method used to sort the mongoose query results based of given query parameters passed into the query string url by the user (sort)
   * example/api/v1/product?sort=category,price
   * @returns an instance of the current class
   */
  sort() {
    //Sort parameter exists, sort the mongoose query documents by them
    if (this.expressQuery.sort) {
      //{sort: "price category"} WHAT IS NEEDED
      //{sort: "price,category"} WHAT ALREADY EXISTS
      const sortBy = this.expressQuery.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    }
    //Sort parameters do not exist, sort the mongoose query document by the document's creation date
    else {
      this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
    }
    return this;
  }

  /**
   * Method used to project or more specific to limit the fields in the mongoose query document results based of given query parameters passed into the query string url by the user (sort)
   * example/api/v1/product?fields=name,category
   * @returns an instance of the current class
   */
  project() {
    //Fields parameter exists, project or limit the fields the mongoose query documents by them
    if (this.expressQuery.fields) {
      //{fields: "name category"} WHAT IS NEEDED
      //{fields: "name,category"} WHAT ALREADY EXISTS
      const fields = this.expressQuery.fields.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.select(sortBy);
    }
    //Fields parameters do not exist, remove the unwanted verion field right from the schema
    //__v field is a field internally used by mongoose to remove it use simple dash before it
    else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }
    return this;
  }

  /**
   * Method used to paginate the results, this method will return just a range of mongodb documents from the db.
   * Default values for page=1 and limit=100
   * example/api/v1/products?page=2&limit=10
   * 1-10(page 1), 11-20(page 2), 20-30 (page 3)
   * @returns an instance of the current class
   */
  paginate() {
    //convert to Number * and || is a nice trick for defining default values
    const page = this.expressQuery.page * 1 || 1;
    const limit = this.expressQuery.limit * 1 || 1;
    //In order to achieve the desired result, the unwanted result will be skipped
    const skip = (page - 1) * limit;
    this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = FilterApi;
