const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures'); 

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return next(new AppError('No Document found with that ID !', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true, // the new updated document is the one that will be returned .. (send back the updated tour to the client)
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No Document found with that ID !', 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc, // notice
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getOne= (Model,popOptions)=>catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if(popOptions){
    query = query.populate(popOptions);
  }
  const doc = await query
  if(!doc){
    return next(new AppError("No document found with that ID",404))
  }
  res.status(200).json({
    status: 'success',
    data: doc,
  })
})

exports.getAll = Model => catchAsync(async (req, res,next) => {
  // this is for Nested Get reviews in tour 
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  // to here
  const features = new APIFeatures(Model.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const docs = await features.query;

  // Send Response
  res.status(200).json({
    status: 'success',
    results: docs.length,
    docs,
  });
});












// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tour = await Tour.findByIdAndDelete(id);
//   if (!tour) {
//     return next(new appError('No Tour found with that ID !', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
