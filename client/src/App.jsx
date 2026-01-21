import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        {/* Navigation Bar */}
        <nav className="bg-white shadow p-4 mb-6 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">My Deals App</h1>
            <div className="space-x-4">
                <Link to="/" className="hover:text-blue-500 font-medium">Home</Link>
                {/* Admin link is hidden. Access via URL /admin */}
            </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;