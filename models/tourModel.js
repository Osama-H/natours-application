const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour Name must have less or equal 40 characters'],
      minlength: [10, 'A tour Name must have more or equal 10 characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    reatingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          // this only points to current doc on new document creation, no work on update
          return val <= this.price;
        },
        message: 'Discount Price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      // in the overview page ..
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trime: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point', // we can specify multiple Geometries in MongoDB like (point, polygons, lines)
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 => ascending order ,  -1 => descending order
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// this getter function will called when the virtual property is accessed.
tourSchema.virtual('diurationWeeks').get(function () {
  return this.duration / 7;
});

// Document Middleware : runs berfore .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  // now this keyword will point to current query object not the current document
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  // this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

// This MiddleWare will run after the query has already executed
tourSchema.post(/^find/, function (docs, next) {
  // all the documents that return from the query
  console.log(`${Date.now() - this.start}`);
  next();
});

module.exports = mongoose.model('Tour', tourSchema);
