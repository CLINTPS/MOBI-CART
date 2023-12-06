function errorHandler(err, req, res, next) {
    console.error(err.stack); 
  
    res.status(404).render('errorView/404admin', { title: 'Internal Server Error' });
  }
  
  module.exports = errorHandler;
  