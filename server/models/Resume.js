const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  versionName: { type: String, default: 'Resume v1' },

  personalInfo: {
    name:     { type: String, default: '' },
    email:    { type: String, default: '' },
    phone:    { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github:   { type: String, default: '' },
    summary:  { type: String, default: '' },
  },

  education: [{
    institution: String,
    degree:      String,
    field:       String,
    startYear:   String,
    endYear:     String,
    gpa:         String,
  }],

  workExperience: [{
    company:     String,
    role:        String,
    startDate:   String,
    endDate:     String,
    description: String,
  }],

  skills:   [String],

  projects: [{
    name:        String,
    description: String,
    techStack:   String,
    link:        String,
  }],

  atsScore: { type: Number, default: null },
  atsTips:  [String],
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
