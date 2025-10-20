import React, { useEffect, useState } from 'react';

function SurveyPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/questions')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(async (qs) => {
        console.log('Полученные данные вопросов:', qs);
        if (Array.isArray(qs)) {
          setQuestions(qs);

          const choicesData = {};
          for (let q of qs) {
            if (q.is_choice_based) {
              try {
                const res = await fetch(`http://localhost:3001/api/questions/${q.id}/choices`);
                if (!res.ok) {
                  throw new Error(`HTTP error! status: ${res.status}`);
                }
                const ch = await res.json();
                choicesData[q.id] = ch;
              } catch (err) {
                console.error(`Ошибка загрузки вариантов для questionId ${q.id}:`, err);
                choicesData[q.id] = [];
              }
            }
          }
          setChoices(choicesData);
        } else {
          console.error('Данные не являются массивом:', qs);
          setQuestions([]);
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки вопросов:', err);
        setError(err.message);
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleRatingClick = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let question of questions) {
      const answer = answers[question.id];
      if (!answer) continue;

      let payload;
      if (question.is_choice_based) {
        const selectedChoice = choices[question.id]?.find(c => c.choice_text === answer);
        if (!selectedChoice) {
          console.warn(`Вариант для questionId ${question.id} не найден: ${answer}`);
          continue;
        }
        payload = {
          question_id: question.id,
          choice_id: selectedChoice.id
        };
      } else if (question.is_rating_based) {
        payload = {
          question_id: question.id,
          answer_text: answer.toString()
        };
      } else {
        payload = {
          question_id: question.id,
          answer_text: answer
        };
      }

      try {
        const response = await fetch('http://localhost:3001/api/answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) {
          console.error(`Ошибка при отправке для questionId ${question.id}:`, data.error);
          continue;
        }
        console.log(`Успешно отправлено для questionId ${question.id}:`, data);
      } catch (err) {
        console.error(`Ошибка сети для questionId ${question.id}:`, err);
      }
    }

    alert('Спасибо за участие!');
    setAnswers({});
  };

  if (loading) return <div className="p-6 text-center">Загрузка...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Ошибка: {error}</div>;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Опрос</h2>

      {questions.length > 0 ? (
        questions.map((q) => (
          <div key={q.id} className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              <strong>{q.question_text}</strong>
            </label>
            {q.is_choice_based ? (
              <select
                value={answers[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition duration-150 ease-in-out"
              >
                <option value="" disabled>Выберите вариант</option>
                {choices[q.id]?.map(c => (
                  <option key={c.id} value={c.choice_text}>
                    {c.choice_text}
                  </option>
                )) || <option disabled>Варианты не загружены</option>}
              </select>
            ) : q.is_rating_based ? (
              <div className="grid grid-cols-5 gap-2 mt-4 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingClick(q.id, value)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${answers[q.id] === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => handleChange(q.id, e.target.value)}
                required
                placeholder="Введите ответ"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700 transition duration-150 ease-in-out"
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">Нет вопросов</div>
      )}

      <button
        type="submit"
        disabled={Object.keys(answers).length === 0}
        className="w-full bg-indigo-600 text-white py-2 rounded-md shadow hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Отправить
      </button>
    </form>
  );
}

export default SurveyPage;