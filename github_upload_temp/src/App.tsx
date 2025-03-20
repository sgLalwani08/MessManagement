import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MenuEditor from './components/MenuEditor';
import DailyMenu from './components/DailyMenu';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/menu" element={<DailyMenu />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin/menu-editor" element={<MenuEditor />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;