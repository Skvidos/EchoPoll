import React, { useState } from 'react';

function FeedbackForm({ onFeedbackSent }) {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !comment.trim()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), comment: comment.trim() })
      });
      if (!response.ok) throw new Error('Ошибка отправки отзыва');
      setUsername('');
      setComment('');
      onFeedbackSent();
      alert('Отзыв успешно отправлен!');
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Произошла ошибка при отправке отзыва.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto space-y-6"
    >
      <h3 className="text-2xl font-semibold text-indigo-600 text-center">Оставить отзыв</h3>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
          Ваше имя
        </label>
        <input
          id="username"
          type="text"
          placeholder="Введите ваше имя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition duration-150 ease-in-out"
        />
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Ваш комментарий
        </label>
        <textarea
          id="comment"
          placeholder="Введите ваш комментарий"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition duration-150 ease-in-out h-32 resize-y"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-md shadow hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!username.trim() || !comment.trim()}
      >
        Отправить отзыв
      </button>
    </form>
  );
}

export default FeedbackForm;