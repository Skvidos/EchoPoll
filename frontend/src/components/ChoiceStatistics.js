import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

function ChoiceStatistics() {
  const { questionId } = useParams();
  const [data, setData] = useState([]);
  const [questionText, setQuestionText] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/api/statistics/choices/${questionId}`)
      .then(res => res.json())
      .then(setData);

    fetch(`http://localhost:3001/api/questions`)
      .then(res => res.json())
      .then(qs => {
        const found = qs.find(q => q.id.toString() === questionId);
        if (found) setQuestionText(found.question_text);
      });
  }, [questionId]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Статистика по вопросу:</h2>
      <h3 style={{ marginBottom: '2rem' }}>{questionText}</h3>

      {data.length === 0 ? (
        <p>Нет данных для отображения.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="choice_text" label={{ value: 'Оценка', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Кол-во', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ChoiceStatistics;
