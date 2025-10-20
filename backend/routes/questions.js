const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM questions', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.get('/:id/choices', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM choices WHERE question_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM questions WHERE id = ?', [id]);

    res.status(200).json({ message: 'Вопрос успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении вопроса:', error);
    res.status(500).json({ message: 'Ошибка при удалении вопроса' });
  }
});


module.exports = router;
