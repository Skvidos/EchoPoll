import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import SurveyForm from './components/SurveyForm';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import AdminPanel from './components/AdminPanel';
import LoginPage from './components/LoginPage';
import StatisticsDashboard from './components/StatisticsDashboard';
import ChoiceStatistics from './components/ChoiceStatistics';
import StatisticsViewer from './components/StatisticsViewer';

function HomePage({ onFeedbackSent, reloadFlag }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-indigo-600">EchoPoll</h1>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 transition">
            <LockClosedIcon className="h-8 w-8" />
          </Link>
        </div>
        <p className="text-lg text-gray-700 mb-6 text-center">Поделитесь своим мнением! Анонимно. Быстро. Важно.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-indigo-500 mb-2">Пройти опрос</h2>
            <SurveyForm />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-indigo-500 mb-2">Отзывы</h2>
            <FeedbackList reloadFlag={reloadFlag} />
          </div>
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-indigo-500 mb-2">Оставить отзыв</h2>
            <FeedbackForm onFeedbackSent={onFeedbackSent} />
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <Link to="/statistics" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
            Перейти к статистике
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);

  const handleFeedbackSent = () => {
    setReloadFlag(!reloadFlag);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage onFeedbackSent={handleFeedbackSent} reloadFlag={reloadFlag} />}
        />
        <Route path="/stats" element={<StatisticsDashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/stats/choices/:questionId" element={<ChoiceStatistics />} />
        <Route path="/statistics" element={<StatisticsViewer />} />
      </Routes>
    </Router>
  );
}

export default App;