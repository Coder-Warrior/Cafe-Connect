import React from 'react';
import ReactDOM from 'react-dom/client';
import ImageUpload from './components/imageUpload.jsx'
import MainPage from './components/mainPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<MainPage />}></Route>
    <Route path="/internet-connection" element={<ImageUpload />}></Route>
  </Routes>
  </BrowserRouter>
);

