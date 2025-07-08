import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/LoginForm";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Authenticate from "./components/authenticate/Authenticate";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

import { getToken, removeToken } from "./services/localStorageService";
import { getCurrentUser } from "./services/userService";
import ChatAi from "./pages/ChatAi";
import EventPublicLayout from "./components/event/EventPublicLayout";
import EventPublicDetail from "./components/event/EventPublicDetail";
import EventForm from "./components/event/EventForm";
import EventPrivateList from "./components/event/EventPrivateList";
import EventPrivateDetail from "./components/event/EventPrivateDetail";

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status and fetch user data on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          removeToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";
  };

  const handleLoginSuccess = async (): Promise<void> => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to fetch user data after login:", error);
      throw new Error("Failed to fetch user data after login");
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner message="Đang kiểm tra xác thực..." />;
  }

  return (
    <div className="app-container">
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={user?.role} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/authenticate" element={<Authenticate onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}
          <Route path="/events" element={<EventPublicLayout />} />
          <Route path="/events/:slug" element={<EventPublicDetail />} />
          <Route path="/organizer/events" element={<EventPrivateList />} />
          <Route path="/organizer/events/new" element={<EventForm />} />
          <Route path="/organizer/events/:id" element={<EventPrivateDetail />} />
          <Route path="/moderator/events" element={<EventPrivateList />} />
          <Route path="/moderator/events/:id" element={<EventPrivateDetail />} />
          
          <Route path="/admin/premium" />
          <Route path="/admin/premiums/:id" />
          
          {/* Public Routes */}
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
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              userRole={user?.role} 
              requiredRole="admin"
              requireExactRole={true}
            >
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
