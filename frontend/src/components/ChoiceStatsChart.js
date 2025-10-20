import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function ChoiceStatsChart({ questionId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/statistics/choices/${questionId}`)
      .then(res => res.json())
      .then(setData);
  }, [questionId]);

  if (data.length === 0) return <p>Нет данных для отображения</p>;

  return (
    <PieChart width={400} height={300}>
      <Pie
        data={data}
        dataKey="count"
        nameKey="choice_text"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}

export default ChoiceStatsChart;
