import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faQuestionCircle, faUniversity, faBriefcase } from '@fortawesome/free-solid-svg-icons';

// Your original service imports
import { getAllUsers } from "../../services/userService";
import quizService from "../../services/quizService";
import { getToken } from "../../services/localStorageService";

import "../../styles/AdminDashboard.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// A single state object for all dashboard data
interface DashboardData {
  userCount: number;
  quizCount: number;
  universityCount: number;
  careerCount: number;
}

const AdminDashboard: React.FC = () => {
  // Use a single state object for data to simplify updates
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This is your original fetchCounts function, adapted to set the new state
    async function fetchCounts() {
      function getAuthHeaders(): Record<string, string> {
        const token = getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
      }

      setLoading(true);
      setError(null);
      
      try {
        // These will hold the fetched counts
        let userCount = 0;
        let quizCount = 0;
        let universityCount = 0;
        let careerCount = 0;

        // Users
        const userRes = await getAllUsers(0, 1);
        userCount = userRes.totalElements || 0;

        // Quizzes
        const quizzes = await quizService.getAllQuizzes();
        quizCount = quizzes.length;

        // Universities (using your original fetch)
        try {
          const response = await fetch("http://localhost:8080/api/v1/university/universities", {
            method: "GET",
            headers: getAuthHeaders(),
          });
          const uniRes = await response.json();
          universityCount = uniRes.result ? uniRes.result.length : 0;
        } catch (e) {
          console.error("Failed to fetch universities:", e);
          universityCount = 0; // Gracefully fail
        }

        // Careers (using your original fetch)
        try {
          const response = await fetch("http://localhost:8080/api/v1/career/careers", {
            method: "GET",
            headers: getAuthHeaders(),
          });
          const careerData = await response.json();
          careerCount = careerData.result ? careerData.result.length : 0;
        } catch (e) {
          console.error("Failed to fetch careers:", e);
          careerCount = 0; // Gracefully fail
        }
        
        // Set all data at once in the state object
        setData({
          userCount,
          quizCount,
          universityCount,
          careerCount
        });

      } catch (err) {
        console.error("An error occurred while fetching counts:", err);
        setError("Could not load some dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []); // Empty dependency array ensures this runs only once

  // --- All UI, Animation, and Chart logic remains the same as the previous answer ---

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  
  const chartData = {
    labels: ['Users', 'Quizzes', 'Universities', 'Careers'],
    datasets: [{
      label: 'Total Count',
      data: data ? [data.userCount, data.quizCount, data.universityCount, data.careerCount] : [],
      backgroundColor: [
        'rgba(33, 150, 243, 0.6)',
        'rgba(255, 152, 0, 0.6)',
        'rgba(156, 39, 176, 0.6)',
        'rgba(0, 188, 212, 0.6)',
      ],
      borderColor: [
        'rgba(33, 150, 243, 1)',
        'rgba(255, 152, 0, 1)',
        'rgba(156, 39, 176, 1)',
        'rgba(0, 188, 212, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Platform Content Overview', font: { size: 18 } },
    },
  };

  if (loading) return <div className="admin-dashboard-status">Loading Dashboard...</div>;
  if (error && !data) return <div className="admin-dashboard-status">{error}</div>;
  
  return (
    <div className="admin-dashboard-container">
      <h1 className="admin-dashboard-header">Admin Dashboard</h1>

      {data && (
        <motion.div
          className="admin-dashboard-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stat Cards */}
          <motion.div className="admin-dashboard-card" variants={itemVariants}>
            <div className="admin-dashboard-card-header">
              <h3 className="admin-dashboard-card-title">Total Users</h3>
              <span className="admin-dashboard-card-icon icon-users"><FontAwesomeIcon icon={faUsers} /></span>
            </div>
            <p className="admin-dashboard-count">{data.userCount}</p>
          </motion.div>

          <motion.div className="admin-dashboard-card" variants={itemVariants}>
            <div className="admin-dashboard-card-header">
              <h3 className="admin-dashboard-card-title">Total Quizzes</h3>
              <span className="admin-dashboard-card-icon icon-quizzes"><FontAwesomeIcon icon={faQuestionCircle} /></span>
            </div>
            <p className="admin-dashboard-count">{data.quizCount}</p>
          </motion.div>

          <motion.div className="admin-dashboard-card" variants={itemVariants}>
            <div className="admin-dashboard-card-header">
              <h3 className="admin-dashboard-card-title">Total Universities</h3>
              <span className="admin-dashboard-card-icon icon-universities"><FontAwesomeIcon icon={faUniversity} /></span>
            </div>
            <p className="admin-dashboard-count">{data.universityCount}</p>
          </motion.div>

          <motion.div className="admin-dashboard-card" variants={itemVariants}>
            <div className="admin-dashboard-card-header">
              <h3 className="admin-dashboard-card-title">Total Careers</h3>
              <span className="admin-dashboard-card-icon icon-careers"><FontAwesomeIcon icon={faBriefcase} /></span>
            </div>
            <p className="admin-dashboard-count">{data.careerCount}</p>
          </motion.div>

          {/* Chart */}
          <motion.div className="admin-dashboard-chart-container" variants={itemVariants}>
             <Bar options={chartOptions} data={chartData} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;