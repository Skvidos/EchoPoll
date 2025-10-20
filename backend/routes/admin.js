const express = require('express');
const router = express.Router();
const db = require('../db');

// Удалить вопрос
router.delete('/questions/:id', (req, res) => {
  const id = parseInt(req.params.id);

  db.query('SELECT * FROM questions WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Ошибка при проверке вопроса:', err);
      return res.status(500).json({ error: 'Ошибка при проверке вопроса', details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Вопрос не найден' });
    }

    db.query('DELETE FROM answers WHERE question_id = ?', [id], (err) => {
      if (err) {
        console.error('Ошибка при удалении ответов:', err);
        return res.status(500).json({ error: 'Ошибка при удалении ответов', details: err.message });
      }

      db.query('DELETE FROM questions WHERE id = ?', [id], (err, result) => {
        if (err) {
          console.error('Ошибка при удалении вопроса:', err);
          return res.status(500).json({ error: 'Ошибка при удалении вопроса', details: err.message });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Вопрос не найден или уже удален' });
        }
        console.log(`Вопрос с ID ${id} успешно удален`);
        res.json({ success: true });
      });
    });
  });
});

router.post('/questions', (req, res) => {

  const { question_text, is_choice_based, is_rating_based, is_text_based } = req.body;

  if (!question_text || question_text.trim() === '') {
    console.log('Ошибка: Пустой текст вопроса');
    return res.status(400).json({ error: 'Текст вопроса обязателен' });
  }

  const isChoiceBased = is_choice_based === true || is_choice_based === 1 ? 1 : 0;
  const isRatingBased = is_rating_based === true || is_rating_based === 1 ? 1 : 0;
  const isTextBased = is_text_based === true || is_text_based === 1 ? 1 : 0;

  const activeTypes = [isChoiceBased, isRatingBased, isTextBased].filter(Boolean).length;
  if (activeTypes > 1) {
    return res.status(400).json({ error: 'Выберите только один тип вопроса' });
  }
  if (activeTypes === 0) {
    return res.status(400).json({ error: 'Выберите хотя бы один тип вопроса' });
  }

  db.query(
    'INSERT INTO questions (question_text, is_choice_based, is_rating_based, is_text_based) VALUES (?, ?, ?, ?)',
    [question_text.trim(), isChoiceBased, isRatingBased, isTextBased],
    (err, result) => {
      if (err) {
        console.error('Ошибка при добавлении вопроса (Admin):', err);
        return res.status(500).json({ error: 'Ошибка при добавлении вопроса', details: err.message });
      }
      console.log('Вопрос добавлен с ID:', result.insertId, 'Флаги:', { isChoiceBased, isRatingBased, isTextBased });
      res.json({ success: true, id: result.insertId });
    }
  );
});

module.exports = router;
