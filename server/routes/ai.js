const router    = require('express').Router();
const multer    = require('multer');
const verify    = require('../middleware/verifyToken');
const { openai, generateResponse } = require('../utils/openrouter');
const StudyPlan = require('../models/StudyPlan');
const Note      = require('../models/Note');
const Chat      = require('../models/Chat');
const Resume    = require('../models/Resume');
const Task      = require('../models/Task');

// Model Config (Free Qwen - stable)
const FAST_MODEL = 'qwen/qwen3.6-plus:free';

// Helpers
const safeParseJSON = (text) => {
  try {
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleanText);
  } catch {
    return null;
  }
};

// Multer: in-memory only, max 5MB, PDF/DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and DOCX files are allowed'));
  },
});

// ─── POST /api/ai/study-plan ──────────────────────────────────────────────────
router.post('/study-plan', verify, async (req, res) => {
  const { subject, examDate, dailyHours, knowledgeLevel } = req.body;
  if (!subject || !examDate || !dailyHours || !knowledgeLevel)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  try {
    const targetDate = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

    let pacingInstruction = '';
    if (diffDays < 1) {
      return res.status(400).json({ success: false, message: 'Exam date must be in the future!' });
    } else if (diffDays < 14) {
      pacingInstruction = `This is a CRITICAL short-term deadline (${diffDays} days remaining). Create an INTENSIVE DAY-BY-DAY schedule labeled "Day 1", "Day 2" etc. Do NOT use weeks.`;
    } else {
      pacingInstruction = `This is a long-term goal (${Math.ceil(diffDays / 7)} weeks remaining). Create a balanced WEEK-BY-WEEK schedule labeled "Week 1", "Week 2" etc.`;
    }

    const prompt = `You are an expert academic tutor. Create a detailed study plan:
Subject: ${subject}
Exam Date: ${examDate}
Days Remaining: ${diffDays}
Daily Study Hours: ${dailyHours} hours
Knowledge Level: ${knowledgeLevel}

${pacingInstruction}

Format using Markdown:
- ## for each Day/Week header
- ** for bold key terms
- Bullet points for actionable tasks
- Be specific and highly actionable.`;

    const generatedPlan = await generateResponse(prompt, "You are a professional educational planner. Respond ONLY with the structured markdown plan, no preambles.", FAST_MODEL);

    const plan = await StudyPlan.create({
      userId: req.user.userId,
      subject, examDate, dailyHours, knowledgeLevel, generatedPlan,
    });

    // ─── Extract and create tasks ───
    try {
      const taskLines = generatedPlan.split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(text => text.length > 5 && text.length < 100);

      if (taskLines.length > 0) {
        const taskObjects = taskLines.slice(0, 15).map(title => ({
          userId: req.user.userId,
          title,
          status: 'Todo',
          priority: 'Medium'
        }));
        await Task.insertMany(taskObjects);
        console.log(`✅ Seeded ${taskObjects.length} tasks from study plan`);
      }
    } catch (taskErr) {
      console.error('Failed to seed tasks from study plan:', taskErr.message);
    }

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    console.error('Study plan error:', err.message);
    res.status(500).json({ success: false, message: 'AI service temporarily unavailable: ' + err.message });
  }
});

// ─── POST /api/ai/summarize ───────────────────────────────────────────────────
router.post('/summarize', verify, upload.single('file'), async (req, res) => {
  const { summaryMode, textContent } = req.body;
  let inputText = textContent;

  try {
    if (req.file) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      inputText = data.text;
    }

    if (!inputText || !inputText.trim())
      return res.status(400).json({ success: false, message: 'No text content provided' });

    const mode = summaryMode || 'Quick Summary';
    const prompt = `Summarize the following text using "${mode}" style. Use Markdown with headers and bullet points:\n\n${inputText.substring(0, 15000)}`;
    const summaryContent = await generateResponse(prompt, "You are an expert summarization assistant. Use Markdown formatting.", FAST_MODEL);

    const note = await Note.create({
      userId: req.user.userId,
      title: inputText.substring(0, 40),
      summaryMode: mode,
      summaryContent,
    });

    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI error: ' + err.message });
  }
});

// ─── POST /api/ai/chat (Streaming) ────────────────────────────────────────────
router.post('/chat', verify, async (req, res) => {
  const { message, chatId } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let chat;
    let history = [];

    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.user.userId });
      if (chat) {
        history = chat.messages.slice(-10).map(m => ({
          role: m.role === 'model' ? 'assistant' : 'user',
          content: m.content
        }));
      }
    }

    const stream = await openai.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: 'system', content: 'You are ASCC AI, a helpful study and career copilot. Format your responses with clear Markdown headings, bold, and bullet points.' },
        ...history,
        { role: 'user', content: message }
      ],
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    if (!chat) {
      chat = await Chat.create({
        userId: req.user.userId,
        title: message.substring(0, 40),
        messages: [{ role: 'user', content: message }, { role: 'model', content: fullResponse }],
      });
    } else {
      chat.messages.push({ role: 'user', content: message }, { role: 'model', content: fullResponse });
      await chat.save();
    }

    res.write(`data: ${JSON.stringify({ done: true, chatId: chat._id })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ─── POST /api/ai/ats-score ───────────────────────────────────────────────────
router.post('/ats-score', verify, async (req, res) => {
  const { resumeId } = req.body;
  if (!resumeId) return res.status(400).json({ success: false, message: 'Resume ID required' });

  try {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.userId });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

    const prompt = `Analyze this resume and return ONLY a JSON object in this format:
{"score": <0-100 number>, "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]}

Resume: ${JSON.stringify({ name: resume.name, summary: resume.summary, skills: resume.skills, workExperience: resume.workExperience, education: resume.education })}`;

    const responseText = await generateResponse(prompt, "You are a professional ATS scanner. Return ONLY valid JSON.", FAST_MODEL);
    const parsed = safeParseJSON(responseText);

    if (parsed) {
      resume.atsScore = parsed.score;
      resume.atsTips = parsed.tips;
      await resume.save();
    }

    res.json({ success: true, data: { atsScore: resume.atsScore, atsTips: resume.atsTips } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI error: ' + err.message });
  }
});

// ─── POST /api/ai/interview-questions ────────────────────────────────────────
router.post('/interview-questions', verify, async (req, res) => {
  const { topic, difficulty } = req.body;
  if (!topic) return res.status(400).json({ success: false, message: 'Topic is required' });

  try {
    const prompt = `Generate exactly 6 interview questions for a ${difficulty || 'Medium'} level ${topic} interview.

Return ONLY a JSON array (no other text) in this exact format:
[
  {
    "questionText": "Question text here",
    "hint": "Key concept or approach hint",
    "modelAnswer": "A model answer of 3-5 sentences"
  }
]`;

    const responseText = await generateResponse(prompt, "You are a senior tech interviewer. Return ONLY valid JSON array.", FAST_MODEL);
    const questions = safeParseJSON(responseText);

    if (!questions || !Array.isArray(questions)) {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response. Please try again.' });
    }

    res.json({ success: true, data: { questions, topic, difficulty: difficulty || 'Medium' } });
  } catch (err) {
    console.error('Interview questions error:', err.message);
    res.status(500).json({ success: false, message: 'AI service error: ' + err.message });
  }
});

// ─── POST /api/ai/evaluate-answer ─────────────────────────────────────────────
router.post('/evaluate-answer', verify, async (req, res) => {
  const { questionText, userAnswer, modelAnswer } = req.body;
  if (!questionText || !userAnswer) return res.status(400).json({ success: false, message: 'Question and answer are required' });

  try {
    const prompt = `Evaluate this interview answer and return ONLY a JSON object:
{
  "score": <0-10 number>,
  "feedback": "2-3 sentences of constructive feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}

Question: ${questionText}
Model Answer: ${modelAnswer || 'N/A'}
User Answer: ${userAnswer}`;

    const responseText = await generateResponse(prompt, "You are a senior interviewer. Return ONLY valid JSON.", FAST_MODEL);
    const evaluation = safeParseJSON(responseText);

    if (!evaluation) {
      return res.status(500).json({ success: false, message: 'Failed to evaluate. Please try again.' });
    }

    res.json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI error: ' + err.message });
  }
});

module.exports = router;
