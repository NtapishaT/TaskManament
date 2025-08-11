import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TaskBoard from './components/TaskBoard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;