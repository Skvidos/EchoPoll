// src/components/StatisticsDashboard.js
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChoiceStatsChart from './ChoiceStatsChart';

function StatisticsDashboard() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/statistics')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Статистика по вопросам</h2>
      {stats.length === 0 ? (
        <p>Нет данных для отображения.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question_text" tick={{ fontSize: 12 }} interval={0} angle={-25} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="answers_count" fill="#8884d8" />
          </BarChart>
          <ChoiceStatsChart questionId={1} />
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default StatisticsDashboard;
