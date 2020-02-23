const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
//2. use middleware to add incoming request data
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// 3. Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
// catch all for unhandled rotues
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on ths server`, 404));
});

// global error handling middle ware
app.use(globalErrorHandler);

module.exports = app;
