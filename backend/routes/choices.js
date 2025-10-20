const express = require('express');
const router = express.Router();
const db = require('../db');

// Добавление нового варианта ответа к вопросу
router.post('/', (req, res) => {
  const { questionId, choiceText } = req.body;

  console.log('Полученные данные (Choice):', req.body);

  if (!questionId || !choiceText) {
    console.log('Ошибка: Отсутствуют questionId или choiceText');
    return res.status(400).json({ error: 'Missing questionId or choiceText' });
  }

  const sql = 'INSERT INTO choices (question_id, choice_text) VALUES (?, ?)';
  db.query(sql, [questionId, choiceText], (err, result) => {
    if (err) {
      console.error('Ошибка при добавлении варианта:', err);
      return res.status(500).json({ error: 'Ошибка при добавлении варианта', details: err.message });
    }
    console.log('Вариант добавлен с ID:', result.insertId, 'для вопроса:', questionId);
    res.json({ success: true, choiceId: result.insertId });
  });
});

module.exports = router;