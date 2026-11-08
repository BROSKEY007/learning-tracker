const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError('Name, email and password are required', 400);
    }
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await userRepo.findByEmail(cleanEmail);
    if (existing) {
      throw new AppError('Email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Account created',
    });
  } catch (err) {
    if (err.code === '23505') {
      return next(new AppError('Email already exists', 409));
    }
    next(err);
  }
};