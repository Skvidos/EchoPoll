import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

function StatisticsViewer() {
  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [data, setData] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [chartType, setChartType] = useState('bar');

  const fetchStatistics = useCallback((questionId) => {
    const question = questions.find(q => q.id.toString() === questionId);
    if (!question) {
      setData([]);
      return;
    }

    const url = question.is_choice_based
      ? `http://localhost:3001/api/statistics/choices/${questionId}`
      : `http://localhost:3001/api/statistics/ratings/${questionId}`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(statisticsData => {
        console.log('Полученные данные статистики для questionId', questionId, ':', statisticsData); // Логирование один раз
        let transformedData;
        if (question.is_choice_based) {
          transformedData = Array.isArray(statisticsData)
            ? statisticsData.map(item => ({
              choice_text: item.choice_text || 'Неизвестно',
              count: Number(item.count) || 0
            }))
            : [];
        } else if (question.is_rating_based) {
          transformedData = Object.entries(statisticsData).map(([rating, count]) => ({
            rating: Number(rating),
            count: Number(count) || 0
          })).sort((a, b) => a.rating - b.rating);
        } else {
          transformedData = [];
        }
        setData(transformedData);
      })
      .catch(error => {
        console.error('Ошибка при получении статистики для questionId', questionId, ':', error);
        setData([]);
      });
  }, [questions]);

  useEffect(() => {
    fetch('http://localhost:3001/api/questions')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Полученные вопросы:', data);
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          console.error('Данные не являются массивом:', data);
          setQuestions([]);
        }
      })
      .catch(error => console.error('Ошибка при получении вопросов:', error));
  }, []);

  useEffect(() => {
    if (selectedId && questions.length > 0) {
      const question = questions.find(q => q.id.toString() === selectedId);
      setQuestionText(question ? question.question_text : '');
      fetchStatistics(selectedId);
    } else {
      setData([]);
      setQuestionText('');
    }
  }, [selectedId, questions, fetchStatistics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-700">📊 Статистика по вопросам</h2>
          <Link
            to="/"
            className="text-indigo-600 hover:underline text-sm"
          >
            ← Назад на главную
          </Link>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="p-2 border rounded-md w-full md:w-auto"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Выберите вопрос --</option>
            {questions
              .filter(q => q.is_choice_based || q.is_rating_based)
              .map(q => (
                <option key={q.id} value={q.id}>
                  {q.id} — {q.question_text}
                </option>
              ))}
          </select>

          <select
            className="p-2 border rounded-md w-full md:w-auto"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Столбчатая диаграмма</option>
            <option value="pie">Круговая диаграмма</option>
          </select>
        </div>

        {data.length > 0 ? (
          <>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">{questionText}</h3>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={questions.find(q => q.id.toString() === selectedId)?.is_choice_based ? 'choice_text' : 'rating'} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="count"
                      nameKey={questions.find(q => q.id.toString() === selectedId)?.is_choice_based ? 'choice_text' : 'rating'}
                      cx="50%"
                      cy="50%"
                      outerRadius={130}
                      label
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </>
        ) : selectedId ? (
          <p className="text-gray-600">Нет данных для отображения или count = 0</p>
        ) : null}
      </div>
    </div>
  );
}

export default StatisticsViewer;