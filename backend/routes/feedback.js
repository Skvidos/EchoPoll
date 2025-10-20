const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { username, comment } = req.body;
  db.query(
    'INSERT INTO feedback (username, comment) VALUES (?, ?)',
    [username, comment],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ success: true });
    }
  );
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM feedback ORDER BY submitted_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM feedback WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Ошибка при удалении отзыва:', err);
      return res.status(500).json({ error: 'Ошибка при удалении отзыва' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
