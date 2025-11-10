import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Navbars from './pages/navbars';
import Empolyer from './pages/empolyer';
import AdminHomepage from './pages/adminHomepage';
import DocumentView from './pages/DocumentView';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminMedia from './pages/AdminMedia';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbars/>
        {/* Route configuration */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/employer" element={<Empolyer />} />
          <Route path="/employer/document/:documentId" element={<DocumentView />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          
          {/* Protected Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminHomepage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}
export default App;