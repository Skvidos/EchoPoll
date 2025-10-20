import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('choice');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [newChoice, setNewChoice] = useState('');
  const [choices, setChoices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/login');
    } else {
      fetchQuestions();
      fetchFeedbacks();
    }
  }, []);

  useEffect(() => {
    if (selectedQuestionId) {
      fetchChoices(selectedQuestionId);
    }
  }, [selectedQuestionId]);

  const fetchQuestions = () => {
    fetch('http://localhost:3001/api/questions')
      .then(res => res.json())
      .then(data => {
        const formattedQuestions = data.map(q => ({
          ...q,
          is_choice_based: q.is_choice_based === 1,
          is_rating_based: q.is_rating_based === 1
        }));
        setQuestions(formattedQuestions);
      });
  };

  const fetchFeedbacks = () => {
    fetch('http://localhost:3001/api/feedback')
      .then(res => res.json())
      .then(setFeedbacks);
  };

  const fetchChoices = (questionId) => {
    fetch(`http://localhost:3001/api/questions/${questionId}/choices`)
      .then(res => res.json())
      .then(setChoices);
  };
  const addQuestion = async () => {
    if (!newQuestion.trim()) return;
    const payload = {
      question_text: newQuestion,
      is_choice_based: questionType === 'choice',
      is_rating_based: questionType === 'rating',
      is_text_based: questionType === 'text'
    };
    console.log('Отправляемый payload:', payload);
    const response = await fetch('http://localhost:3001/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log('Ответ сервера:', result);
    if (result.success) {
      setNewQuestion('');
      fetchQuestions();
    }
  };

  const deleteQuestion = async (id) => {
    console.log('Удаление вопроса с ID:', id);
    const response = await fetch(`http://localhost:3001/api/admin/questions/${id}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (result.success) {
      fetchQuestions();
    }
  };


  const addChoice = async () => {
    if (!newChoice.trim() || !selectedQuestionId) return;
    await fetch('http://localhost:3001/api/choices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: selectedQuestionId,
        choiceText: newChoice
      })
    });
    setNewChoice('');
    fetchChoices(selectedQuestionId);
  };

  const deleteFeedback = async (id) => {
    await fetch(`http://localhost:3001/api/feedback/${id}`, {
      method: 'DELETE'
    });
    fetchFeedbacks();
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <div className="p-6 bg-gray-100 min-h-screen max-w-5xl mx-auto rounded-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Админ-панель</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Выйти
          </button>
        </div>

        {/* Добавление вопроса с выбором типа */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Добавить новый вопрос</h3>
          <input
            type="text"
            placeholder="Новый вопрос"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />
          <div className="flex flex-col space-y-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="choice"
                checked={questionType === 'choice'}
                onChange={(e) => setQuestionType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">С вариантами ответа</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="rating"
                checked={questionType === 'rating'}
                onChange={(e) => setQuestionType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">Оценка (1-10)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={questionType === 'text'}
                onChange={(e) => setQuestionType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">Чисто текст</span>
            </label>
          </div>
          <button
            onClick={addQuestion}
            className="w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Добавить вопрос
          </button>
        </div>

        {/* Список вопросов */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Все вопросы</h3>
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li key={q.id} className="flex justify-between items-center">
              <div>
                <span className="font-bold">{index + 1}.</span>{' '}
                {q.question_text}{' '}
                {q.is_choice_based && '(с вариантами)'}
                {q.is_rating_based && '(оценка 1-10)'}
                {!q.is_choice_based && !q.is_rating_based && '(текст)'}
              </div>
              <button
                onClick={() => deleteQuestion(q.id)}
                className="ml-4 text-red-600 hover:text-red-700"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>

        <hr className="my-6" />

        {/* Добавление вариантов */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Добавление вариантов ответа</h3>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Выберите вопрос</label>
          <select
            value={selectedQuestionId}
            onChange={(e) => setSelectedQuestionId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={!questions.some(q => q.is_choice_based)}
          >
            <option value="">-- выбрать --</option>
            {questions
              .filter((q) => q.is_choice_based)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.id} — {q.question_text}
                </option>
              ))}
          </select>
        </div>

        {selectedQuestionId && (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Вариант ответа"
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={addChoice}
                className="mt-2 w-full p-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Добавить вариант
              </button>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mb-4">Текущие варианты</h4>
            <ul className="space-y-2">
              {choices.map((choice) => (
                <li key={choice.id} className="text-gray-700">
                  {choice.choice_text}
                </li>
              ))}
            </ul>
          </>
        )}

        <hr className="my-6" />

        {/* Список отзывов */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Отзывы</h3>
        <ul className="space-y-4">
          {feedbacks.map((f) => (
            <li key={f.id} className="flex justify-between items-center">
              <div>
                <strong className="text-gray-700">{f.username || 'Аноним'}</strong>: {f.comment}
              </div>
              <button
                onClick={() => deleteFeedback(f.id)}
                className="ml-4 text-red-600 hover:text-red-700"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminPanel;