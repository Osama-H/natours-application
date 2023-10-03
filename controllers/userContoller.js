const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multer = require("multer");
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user-userid-current timestamp
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)

//   }
// });

const multerStorage = multer.memoryStorage(); // this way the image will then be stored as a buffer.

const multerFilter = (req, file, cb) => { // to Test if the uploaded file is an image, this works for all kind of stuff, not for only images
  if (file.mimetype.split('/')[0] == 'image') {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images"), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync(async(req, res, next) => {
  if (!req.file) {
    return next();
  }
  // we can definde the quality of this jpeg to compress it a little bit
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`)

  next();
})


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   // Send Response
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     users,
//   });
// });

exports.getAllUsers = factory.getAll(User)

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}



// It's for updating the currently authenticated user. (name, and email address)
exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);

  // 1) create an error if user POSTs password Data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This Route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     message: 'This route is not yet defined !',
//   });
// };

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined !, Please Use /signup instead',
  });
};

// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'fail',
//     message: 'This route is not yet defined !',
//   });
// };



exports.getUser = factory.getOne(User);

// Don't update the user password by this !
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
