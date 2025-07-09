import React from 'react';
import type { AdminStats } from '../../pages/Admin';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsProps {
  stats: AdminStats;
}

const Analytics: React.FC<AnalyticsProps> = ({ stats }) => {
  // Mock data for charts
  const userGrowthData = [
    { month: 'Jan', users: 1000 },
    { month: 'Feb', users: 1500 },
    { month: 'Mar', users: 2000 },
    { month: 'Apr', users: stats.totalUsers }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 30000 },
    { month: 'Feb', revenue: 35000 },
    { month: 'Mar', revenue: 40000 },
    { month: 'Apr', revenue: stats.revenue }
  ];

  const eventData = [
    { name: 'Completed', value: 45 },
    { name: 'Ongoing', value: 30 },
    { name: 'Pending', value: stats.pendingEvents }
  ];

  const quizData = [
    { type: 'Personality', completed: 350 },
    { type: 'IQ', completed: 280 },
    { type: 'Career', completed: stats.completedQuizzes }
  ];

  return (
    <div className="analytics-container">
      <h2>Analytics Dashboard</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>User Growth</h3>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Revenue Overview</h3>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Event Statistics</h3>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Quiz Completion Rates</h3>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;