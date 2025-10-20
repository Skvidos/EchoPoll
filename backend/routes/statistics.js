const express = require('express');
const router = express.Router();
const db = require('../db');

// Количество ответов по каждому вопросу
router.get('/', (req, res) => {
  const sql = `
        SELECT q.id AS question_id, q.question_text, COUNT(a.id) AS answers_count
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id
        GROUP BY q.id
        ORDER BY q.id
    `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Кол-во ответов по каждому выбору для одного вопроса
router.get('/choices/:questionId', (req, res) => {
  const { questionId } = req.params;
  const sql = `
        SELECT answer_text AS choice_text, COUNT(*) AS count
        FROM answers
        WHERE question_id = ?
        GROUP BY answer_text
    `;
  db.query(sql, [questionId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении статистики:', err);
      return res.status(500).json({ error: 'Ошибка при получения статистики', details: err.message });
    }
    console.log('Статистика для questionId', questionId, ':', results);
    res.json(results);
  });
});

// Кол-во ответов по оценкам (0-10) для одного вопроса
router.get('/ratings/:questionId', (req, res) => {
  const { questionId } = req.params;
  const sql = `
        SELECT 
            CAST(answer_text AS UNSIGNED) AS rating, 
            COUNT(*) AS count
        FROM answers
        WHERE question_id = ? AND answer_text REGEXP '^[0-9]+$' AND CAST(answer_text AS UNSIGNED) BETWEEN 0 AND 10
        GROUP BY rating
        ORDER BY rating
    `;
  db.query(sql, [questionId], (err, results) => {
    if (err) {
      console.error('Ошибка при получении статистики оценок:', err);
      return res.status(500).json({ error: 'Ошибка при получении статистики оценок', details: err.message });
    }
    console.log('Статистика оценок для questionId', questionId, ':', results);
    const ratingsData = {};
    for (let i = 0; i <= 10; i++) {
      ratingsData[i] = 0;
    }
    results.forEach(row => {
      ratingsData[row.rating] = row.count;
    });
    res.json(ratingsData);
  });
});

module.exports = router;