import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import "./App.css";
import Login from "./pages/LoginForm";
import Admin from "./pages/Admin";
import Quiz from "./pages/Quiz";
import Authenticate from "./components/authenticate/Authenticate";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
function App() {
  // Example authentication state and logout handler
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Add any additional logout logic here
  };

  return (
    <div className="app-container">
      <NavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/authenticate" element={<Authenticate />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Register />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
