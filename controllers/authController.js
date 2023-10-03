const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const dotenv = require('dotenv');


dotenv.config({ path: '../config.env' });

// const signToken = (id) =>{
//   const token = jwt.sign(id,process.env.JWT_SECRET,{
//     expiresIn : process.env.JWT_EXPIRES_IN
//   });

// }

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // const token = signToken(newUser._id);

  res.cookie('jwt', token, {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure : true,
    httpOnly: true,
  });

  newUser.password = undefined;
  
  res.status(201).json({
    status: 'success',
    token,
    newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if Email and Password exist
  if (!email || !password) {
    return next(new AppError('Please Provide Email and Password', 400));
  }
  // 2) Check if User(for the email that was posted) exists && password is correct

  const user = await User.findOne({ email: email }).select('+password');

  // const correct = await user.correctPassword(password, user.password)

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  // const token = signToken(user._id)
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true, // for sensitive data
    httpOnly: true,
  }

res.cookie('jwt', token,cookieOptions)

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.logout = (req,res)=>{

  res.cookie('jwt','loggedout',{
    expiresIn : new Date(Date.now() + 10*1000),
    httpOnly : true
  })

  // res.clearCookie('jwt');

  res.status(200).json({
    status : "success"
  })

}






exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Getting Token and check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }else if(req.cookies.jwt){
    token = req.cookies.jwt
  }
  if (!token) {
    return next(
      new AppError('You are not logged in ! Please log in to get access', 401)
    );
  }
  // 2) Verification the Token  (no one change the payload)
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // console.log(decodedPayload);
  // 3) Check if user still exists
  const currentUser = await User.findById(decodedPayload.id);
  if (!currentUser) {
    return next(
      new AppError('The User belonging to this user does no longer exist', 401)
    );
  }
  // 4) Check if User changed password after the token was issued

  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError('User Recently changed Password!, Please login again', 401)
    );
  }
  // Let's put the entire User data on the request ..

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

// // Only for rendered pages, no error !
// exports.isLoggedIn = async (req, res, next) => {
//   try{


//    if(req.cookies.jwt){
    
//     // 1) verify roken  
  
//     const decodedPayload = await promisify(jwt.verify)(
//     req.cookies.jwt,
//     process.env.JWT_SECRET
//   );
  
//   // console.log(decodedPayload);

//   // 2) Check if user still exists

//   const currentUser = await User.findById(decodedPayload.id);

//   if (!currentUser) {
//     return next();
//   }

//   // 3) Check if User changed password after the token was issued

//   if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
//     return next();
//   }

//   // There is a logged in user

//   res.locals.user = currentUser;
//   next();
// }catch(err){
//   return next();
//  }}
// };

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};



exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perfrom this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User Based on Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate the random reset roken

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false }); // this will then deactivate all the validators that we specified in our schema.

  // 3) Send it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your Password? submit a PATCH request with your new password and password confirm to : ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset Token',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later !',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) update changedPasswordAt property for the user

  user.chanedPassword;

  // 4) log the user in, send JWT

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  }

  

res.cookie('jwt', token,cookieOptions)



  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get User From Collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('Theres no User with this Id', 404));
  }
  // 2) Check if the Posted Password is Correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('You Current Password is Wrong', 401));
  }

  // 3) if so, update the password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in by send the Jwt

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie('jwt', token, {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });
  res.status(201).json({
    status: 'success',
    token,
    user,
  });
});


