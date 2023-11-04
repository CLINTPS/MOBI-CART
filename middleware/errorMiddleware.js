function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).render('errorView/404admin'); // You can customize the error page and status code
}

module.exports={
    errorHandler,
}