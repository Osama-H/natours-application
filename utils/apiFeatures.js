class APIFeatures {
  constructor(query, queryString) {
    // this is the function that automatically called as soon as we create a new object out of this class
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const exculdedFields = ['page', 'sort', 'limit', 'fields'];
    // remove all this fields from the queryObj
    exculdedFields.map((el) => delete queryObj[el]);
    // console.log(req.query);

    // 1B) Advanced Filtering

    let queryStr = JSON.stringify(queryObj); // convert object to String ..
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr)); // convert string to object

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // this is the entire object
  }
  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replaceAll(',', ' ');

      this.query = this.query.sort(sortBy);
      // In Mongoose sort('price ratingsAverage')
    } else {
      // let's adding a defauly
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitFields() {
    // 3) Field Limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replaceAll(',', ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    // 4) Pagination

    /*
      page=2&limit=10
      1-10 page 1 
      11 - 20 page 2
      */

    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = page * limit - limit;
    // skip = (page - 1 ) * limit

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures