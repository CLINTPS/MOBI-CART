// errorMiddleware.js

function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error
  
    // You can customize the error response as per your requirements
    res.status(404).render('errorView/404admin', { title: 'Internal Server Error' });
  }
  
  module.exports = errorHandler;
  