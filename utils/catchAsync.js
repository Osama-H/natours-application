module.exports = (fn) => {
    // return a new anonymous function, which will then be assigned to createTour
    return (req,res,next)=>{
    fn(req, res, next).catch((err) => next(err));
  }};