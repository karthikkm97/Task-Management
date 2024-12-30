import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import TaskList from './pages/TaskList/TaskList';

const App = () => {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={Login} />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route path="/dashboard" element={<Home />} />
          <Route path="/taskList" element={<TaskList />} />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
