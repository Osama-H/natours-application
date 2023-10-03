const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSaniztize = require('express-mongo-sanitize')
const xss = require('xss-clean')

const cookieParser = require('cookie-parser')


const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');



const app = express();





app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'))

app.use(express.static(path.join(__dirname,'public')));



app.use(helmet({contentSecurityPolicy:false}));
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ['none'],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: ["'self'", 'data:', 'blob:'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: [
          "'self'",
          'blob:',
          'wss:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "unpkg.com"],
//       styleSrc: ["'self'", "cdnjs.cloudflare.com"],
//       // fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
//     },
//   })
// );



 // Set security HTTP headers
//  app.use(helmet());
 // Further HELMET configuration for Security Policy (CSP)


//  const scriptSrcUrls = [
//    'https://api.tiles.mapbox.com/',
//    'https://api.mapbox.com/',
//    'https://cdnjs.cloudflare.com/',
//    'https://*.stripe.com/',
//    'https://js.stripe.com/',
//  ];
//  const styleSrcUrls = [
//    'https://api.mapbox.com/',
//    'https://api.tiles.mapbox.com/',
//    'https://fonts.googleapis.com/',
//  ];
//  const connectSrcUrls = [
//    'https://api.mapbox.com/',
//    'https://a.tiles.mapbox.com/',
//    'https://b.tiles.mapbox.com/',
//    'https://events.mapbox.com/',
//    'https://bundle.js:*',
//    'ws://127.0.0.1:*/',
//  ];
//  const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
//  app.use(
//    helmet.contentSecurityPolicy({
//      directives: {
//        defaultSrc: [],
//        connectSrc: ["'self'", ...connectSrcUrls],
//        scriptSrc: ["'self'", ...scriptSrcUrls],
//        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//        workerSrc: ["'self'", 'blob:'],
//        frameSrc: ["'self'", 'https://*.stripe.com'],
//        objectSrc: [],
//        imgSrc: ["'self'", 'blob:', 'data:'],
//        fontSrc: ["'self'", ...fontSrcUrls],
//      },
//    })
//  );



const limiter = rateLimit({  // allow 100 requests from the same IP in one hour.
  max : 100,
  windowMs : 60*60*1000,
  message : 'Too many requests from this IP, please try again in an hour'
})

app.use('/api',limiter); // affect aoo of the routes that basically start with this URL


app.use(express.json({limit : '10kb'})); // to access the body of the request ...
app.use(express.urlencoded({extended : true, limit : '10kb'}))
app.use(cookieParser())



// Data sanitization against NoSql query injection
app.use(mongoSaniztize());

// Data sanitization against XSS
app.use(xss());


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use((req, res, next) => {
  console.log('Hello from the middleware !');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // to convert it to a nice readable string ..
  // console.log(req.headers);
  next();
});

// console.log(process.env.NODE_ENV);



app.use('/',viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);



// for unhandled routes

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this server !`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
