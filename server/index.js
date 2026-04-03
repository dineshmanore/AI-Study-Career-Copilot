require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Rate Limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });
const authLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }); // Increased for development
const aiLimiter    = rateLimit({ windowMs: 1  * 60 * 1000, max: 50 });  // Increased for development

app.use(globalLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',               authLimiter,  require('./routes/auth'));
app.use('/api/dashboard',                        require('./routes/dashboard'));
app.use('/api/tasks',                            require('./routes/tasks'));
app.use('/api/study-plans',                      require('./routes/studyPlans'));
app.use('/api/notes',                            require('./routes/notes'));
app.use('/api/chats',                            require('./routes/chats'));
app.use('/api/resumes',                          require('./routes/resumes'));
app.use('/api/interview-sessions',               require('./routes/interviewSessions'));
app.use('/api/ai',                 aiLimiter,    require('./routes/ai'));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ success: true, message: 'ASCC API is running' }));

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── DB + Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
