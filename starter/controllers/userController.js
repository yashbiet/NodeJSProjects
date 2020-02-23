const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Page under Construction'
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //const features = new APIFeatures(User.find(), req.query);

  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});
exports.deleteUser = factory.deleteOne(User);

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Page under Construction'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'Page under Construction'
  });
};
