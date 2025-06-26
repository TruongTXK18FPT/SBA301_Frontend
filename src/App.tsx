import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/LoginForm";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Authenticate from "./components/authenticate/Authenticate";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import { getToken, removeToken } from "./services/localStorageService";
import ChatAi from "./pages/ChatAi";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on app load
  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="app-container">
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          {/* Protected Routes */}
          <Route path="/quiz" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Quiz />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/chat-ai" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChatAi />
            </ProtectedRoute>
          } />

          {/* Public Routes */}
          
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
