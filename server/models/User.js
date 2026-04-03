const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, maxlength: 100, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:  { type: String, required: true, select: false },
  avatarInitial: { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (this.name) this.avatarInitial = this.name.charAt(0).toUpperCase();
  next();
});

module.exports = mongoose.model('User', userSchema);
