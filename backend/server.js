const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const questionsRoutes = require('./routes/questions');
const answersRoutes = require('./routes/answers');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');
const statisticsRoutes = require('./routes/statistics');
const choiceRoutes = require('./routes/choices');

app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/choices', choiceRoutes);

app.listen(3001, () => {
  console.log('Бэкенд сервер запущен на порту 3001');
});
