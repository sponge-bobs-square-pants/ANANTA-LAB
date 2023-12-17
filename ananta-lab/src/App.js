import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<LoginPage />} />
        <Route exact path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
