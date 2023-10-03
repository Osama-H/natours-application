// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   // 1) Create a transporter (the service will actually send the email)
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     secure: false,
//     logger: true,
//     tls: {
//       rejectUnauthorized: true,
//     },
//   });

//   // 2) Define the email options

//   const mailOptions = {
//     from: 'Osama <hello@osama.js>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   // 3) Actually send the email

//   await transporter.sendEmail(mailOptions); // this actually an async function, and it's return a promise
// };

// module.exports = sendEmail;



const nodemailer = require('nodemailer');
 
const sendEmail = async options => {
  //1- Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 587,
    auth: {
      user: 'cb180ae18979a3',
      pass: '8c8aa7bf562156'
    }
  });
 
  //2- Define the email options
  const mailOptions = {
    from: 'Pavan Reddy <pbojjireddy.sap@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };
 
  //3- Send the email
  await transporter.sendMail(mailOptions);
};
 
module.exports = sendEmail;