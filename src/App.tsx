import { useState, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import Alert from "./components/Alert";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/LoginForm";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Authenticate from "./components/authenticate/Authenticate";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import PremiumPage from "./pages/PremiumPage";
import ParentDashBoard from "./pages/ParentDashBoard";

import { getToken, removeToken } from "./services/localStorageService";
import { getCurrentUser } from "./services/userService";
import ChatAi from "./pages/ChatAi";
import EventPublicLayout from "./components/event/EventPublicLayout";
import EventPublicDetail from "./components/event/EventPublicDetail";
import EventForm from "./components/event/EventForm";
import EventPrivateList from "./components/event/EventPrivateList";
import EventPrivateDetail from "./components/event/EventPrivateDetail";
import { logOut, validateToken } from "./services/authService";
import { useSetAtom } from "jotai";
import { subscriptionAtom, userAtom } from "./atom/atom";
import { getSubscriptions } from "./services/premiumService";

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const setUserAtom = useSetAtom(userAtom);
  const setSubscriptionAtom = useSetAtom(subscriptionAtom);
  const [loading, setLoading] = useState(true);
  const [logoutAlert, setLogoutAlert] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });
  const location = useLocation();

  // Routes where navbar should be hidden
  const hideNavbarRoutes = ['/authenticate'];

  // Check authentication status and fetch user data on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      
      if (token) {
        try {
          // First validate the token
          const isTokenValid = await validateToken();
          
          if (isTokenValid) {
            // Token is valid, fetch user data
            const userData = await getCurrentUser();
            
            console.log("User data retrieved:", userData);
            console.log("User role:", userData?.role);
            setUser(userData);
            setUserAtom(userData);
            setIsAuthenticated(true);
            
            // Try to fetch subscription data, but don't fail authentication if it fails
            try {
              const subscriptionData = await getSubscriptions(
                { 
                  uid: userData.id, 
                  status: "active" 
                }
              );
              setSubscriptionAtom(subscriptionData);
            } catch (subscriptionError) {
              console.warn("Could not fetch subscription data:", subscriptionError);
              // Don't break authentication flow if subscription fails
            }
          } else {
            // Token is invalid, clear authentication
            console.log("Token validation failed, logging out");
            removeToken();
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to initialize authentication:", error);
          removeToken();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log("No token found, user not authenticated");
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);
  const navigate = useNavigate();
  const handleLogout = async () => {
    const userName = user?.fullName || "Bạn";
    
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed on backend", error);
    } finally {
      removeToken();
      setIsAuthenticated(false);
      setUser(null);
      
      // Show logout alert
      setLogoutAlert({
        show: true,
        message: `Tạm biệt, ${userName}! Hẹn gặp lại.`,
      });
      
      // Hide alert after 2 seconds and navigate
      setTimeout(() => {
        setLogoutAlert({ show: false, message: "" });
        navigate("/login");
      }, 2000);
    }
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
      {/* Logout Alert */}
      {logoutAlert.show && (
        <Alert
          type="success"
          message={logoutAlert.message}
          duration={2000}
          onClose={() => setLogoutAlert({ show: false, message: "" })}
        />
      )}
      
      {!hideNavbarRoutes.includes(location.pathname) && (
        <NavBar
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userRole={user?.role?.toLowerCase()}
        />
      )}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/authenticate"
            element={<Authenticate onLoginSuccess={handleLoginSuccess} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/premium" element={<PremiumPage isAuthenticated={isAuthenticated} />} />
          {/* <Route path="/complete-profile" element={<CompleteProfile />} /> */}
          <Route path="/events" element={<EventPublicLayout />} />
          <Route path="/events/:slug" element={<EventPublicDetail />} />
          <Route path="/organizer/events" element={<EventPrivateList />} />
          <Route path="/organizer/events/new" element={<EventForm />} />
          <Route path="/organizer/events/:id" element={<EventPrivateDetail />} />
          <Route path="/moderator/events" element={<EventPrivateList />} />
          <Route path="/moderator/events/:id" element={<EventPrivateDetail />} />
          <Route path="/moderator/events/:id" element={<EventPrivateDetail />} />
          
          <Route path="/admin/premium" />
          <Route path="/admin/premiums/:id" />
          
          {/* Public Routes */}
          {/* Protected Routes */}
          <Route
            path="/quiz"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                userRole={user?.role?.toLowerCase()}
                requiredRole="admin"
                requireExactRole={true}
              >
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                userRole={user?.role?.toLowerCase()}
                requiredRole="parent"
                requireExactRole={true}
              >
                <ParentDashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-ai"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ChatAi />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}

          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
