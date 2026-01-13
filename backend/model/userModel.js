const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Waiter', 'Chef', 'Accountant'], default: 'Waiter' },
}, {
  timestamps: true
});


module.exports = mongoose.model('User', userSchema);
