const express = require('express');
const router = express.Router();
const db = require('../db');

// Добавить ответ
router.post('/', (req, res) => {
  const { question_id, answer_text, choice_id } = req.body;
  console.log('Полученные данные:', { question_id, answer_text, choice_id });

  if (!question_id) {
    return res.status(400).json({ error: 'question_id обязателен' });
  }

  db.query(
    'SELECT is_choice_based, is_rating_based FROM questions WHERE id = ?',
    [question_id],
    (err, results) => {
      if (err) {
        console.error('Ошибка при получении типа вопроса:', err);
        return res.status(500).json({ error: 'Ошибка при получении типа вопроса' });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: 'Вопрос с таким ID не найден' });
      }

      const { is_choice_based, is_rating_based } = results[0];

      if (is_choice_based && !choice_id) {
        return res.status(400).json({ error: 'Для вопроса с вариантами нужен choice_id' });
      }
      if (is_rating_based && !answer_text) {
        return res.status(400).json({ error: 'Для вопроса с оценкой нужен answer_text' });
      }
      if (!is_choice_based && !is_rating_based && !answer_text) {
        return res.status(400).json({ error: 'Для текстового вопроса нужен answer_text' });
      }

      if (is_choice_based && choice_id) {
        db.query(
          'SELECT choice_text FROM choices WHERE id = ?',
          [choice_id],
          (err, choiceResults) => {
            if (err) {
              console.error('Ошибка при получении текста выбора:', err);
              return res.status(500).json({ error: 'Ошибка при получении текста выбора' });
            }
            if (choiceResults.length === 0) {
              return res.status(400).json({ error: 'Выбор с таким ID не найден' });
            }

            const choiceText = choiceResults[0].choice_text;
            db.query(
              'INSERT INTO answers (question_id, answer_text, submitted_at) VALUES (?, ?, NOW())',
              [question_id, choiceText],
              (err, result) => {
                if (err) {
                  console.error('Ошибка при вставке:', err);
                  return res.status(500).json({ error: err.message });
                }
                console.log('Успешная вставка, ID:', result.insertId);
                res.json({ success: true, id: result.insertId });
              }
            );
          }
        );
      } else {
        db.query(
          'INSERT INTO answers (question_id, answer_text, submitted_at) VALUES (?, ?, NOW())',
          [question_id, answer_text],
          (err, result) => {
            if (err) {
              console.error('Ошибка при вставке:', err);
              return res.status(500).json({ error: err.message });
            }
            console.log('Успешная вставка, ID:', result.insertId);
            res.json({ success: true, id: result.insertId });
          }
        );
      }
    }
  );
});

// Кол-во ответов по каждому выбору (для одного вопроса)
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
      return res.status(500).json({ error: 'Ошибка при получении статистики', details: err.message });
    }
    console.log('Статистика для questionId', questionId, ':', results);
    res.json(results);
  });
});

module.exports = router;