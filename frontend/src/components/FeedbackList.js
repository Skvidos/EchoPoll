import React, { useEffect, useState } from 'react';

function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/feedback')
      .then(res => {
        if (!res.ok) {
          throw new Error('Ошибка сети или сервера');
        }
        return res.json();
      })
      .then(data => {
        console.log('Полученные данные отзывов (сырые):', data);
        if (Array.isArray(data)) {
          setFeedbacks(data);
        } else {
          console.error('Данные не являются массивом:', data);
          setFeedbacks([]);
        }
      })
      .catch(err => {
        console.error('Ошибка при загрузке отзывов:', err);
        setError(err.message);
        setFeedbacks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      {feedbacks.length > 0 ? (
        feedbacks.map((feedback) => (
          <div key={feedback.id} className="mb-2">
            <strong>{feedback.username || 'Аноним'}</strong>: {feedback.comment}
            <span className="text-sm text-gray-500 ml-2">
              {feedback.submitted_at
                ? new Date(feedback.submitted_at).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : 'Дата неизвестна'}
            </span>
          </div>
        ))
      ) : (
        <div>Нет отзывов</div>
      )}
    </div>
  );
}

export default FeedbackList;