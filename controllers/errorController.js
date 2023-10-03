const AppError = require('../utils/appError')

const sendErrorDev = (err,req, res) => {
  // A) FOR API
  if(req.originalUrl.startsWith('/api')){
   return  res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } // B) this is for rendered website
  return res.status(err.statusCode).render('error',{
      title : 'Something went wrong!',
      msg : err.message
    })
  
};

const handleJWTError = (err)=>{
  return new AppError('Invalid Token, Please Login Again ! ',401)
}


const sendErrorPro = (err, req, res) => {
  // this is for API
  if (req.originalUrl.startsWith('/api')) {
    // A) FOR API
    // Operational, trusted error: send message to client
    if (err.isOperational) {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    // Programming or other unknown error: don't leak error details
    } 
      console.log('ERROR', err);

      return  res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
  } 
  
    // B) this is for rendered website
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
      });
    // Programming or other unknown error: don't leak error details
    } 
      console.log('ERROR', err);

      return  res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later'
      });
    
};


module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 => internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err,req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = {...err};

    if(error.name === 'CastError'){
    //  error = handleCastErrorDB(error)   // this return a new error created with our AppError class, then this error will be marked as operational .. 
    }

    if(err.name === 'JsonWebTokenError') error =  handleJWTError(err);
    sendErrorPro(err,req, res);
  }
}
