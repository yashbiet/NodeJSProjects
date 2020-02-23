const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      // created the error and passed it to the next which would call th error handling middleware
      return next(new AppError('No document found with the given id', 404));
    }
    res.status(204).json({
      status: 'success',
      message: 'Record Deleted'
    });
  });
