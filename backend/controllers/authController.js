const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: existingUser.email === email ? 'Email already registered' : 'Username already taken' });
    }
    const otp = '123456';
    console.log('DEV OTP:', otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({ name, username, email, password, otp: { code: otp, expiresAt: otpExpiry } });
    try {
  await sendOTPEmail(email, name, otp);
} catch (emailError) {
  console.error('Email send failed:', emailError.message);
  // Still return success even if email fails
  return res.status(201).json({ 
    success: true, 
    message: 'Registration successful. OTP email may be delayed.', 
    userId: user._id,
    // In development, return OTP directly
    ...(process.env.NODE_ENV === 'development' && { otp })
  });
}
res.status(201).json({ 
  success: true, 
  message: 'Registration successful. Please verify your email.', 
  userId: user._id 
});
    res.status(201).json({ success: true, message: 'Registration successful. Please verify your email.', userId: user._id });
  } catch (error) { next(error); }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    if (!user.otp || user.otp.code !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otp.expiresAt < new Date()) return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    try { await sendWelcomeEmail(user.email, user.name); } catch (e) {}
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Email verified successfully!', token, user: { id: user._id, name: user.name, username: user.username, email: user.email, currency: user.currency, theme: user.theme } });
  } catch (error) { next(error); }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Email already verified' });
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();
    await sendOTPEmail(user.email, user.name, otp);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first', userId: user._id, needsVerification: true });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, username: user.username, email: user.email, avatar: user.avatar, currency: user.currency, theme: user.theme, notifications: user.notifications } });
  } catch (error) { next(error); }
};

exports.guestLogin = async (req, res, next) => {
  try {
    const guestId = `guest_${Date.now()}`;
    const guestUser = await User.create({
      name: 'Guest User',
      username: guestId,
      email: `${guestId}@guest.expenseiq.pro`,
      password: Math.random().toString(36),
      isVerified: true,
      isGuest: true
    });
    const token = generateToken(guestUser._id);
    res.json({ success: true, token, user: { id: guestUser._id, name: guestUser.name, username: guestUser.username, email: guestUser.email, currency: 'USD', theme: 'dark', isGuest: true } });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency, theme, notifications, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (currency) updates.currency = currency;
    if (theme) updates.theme = theme;
    if (notifications) updates.notifications = notifications;
    if (avatar !== undefined) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) { next(error); }
};
