const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });
  // create JSON Web Token using jwt
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // use ES6 destructuring since email and password key are same hence we can use below syntax
  const { email, password } = req.body;

  // 1. Check if email and password exit
  if (!email || !password) {
    return next(new AppError(' Please provide email and password', 400));
  }

  // 2. check if user and password is valid
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError(' Incorrect email or password', 401));

  // 3. send token back
  const token = signToken(user._id);
  //console.log(token);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1, get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //console.log('token::' + token);

  if (!token) {
    return next(new AppError('Not Logged in. Please login', 401));
  }
  // 2. Verification - validate the token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  //console.log(decodedToken);
  // 3. check if user exists
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser)
    return next(
      new AppError('The User associated with token no loner exist', 401)
    );

  // 4. check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decodedToken.iat))
    return next(new AppError('User Password recently got changed', 401));

  //5. Grant Access to protected ROute
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin, lead-guide]
    if (!roles.includes(req.user.role))
      return next(
        new AppError('User doesnot have access to perform the action', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on POSTed email

  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('Invalid email address', 404));

  // 2. Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Reset Password with PATCH request to ${resetURL}`;
  try {
    console.log(`message::: ${message}`);
    await sendEmail({
      email: user.email,
      subject: 'Password Reset. Valid for 10 mins',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email, Try again later', 500));
  }
});

exports.resetPassword = (req, res, next) => {};
