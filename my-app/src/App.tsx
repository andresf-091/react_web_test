import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Check from './components/Check/Check';
import Record from './components/Record/Record';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check" element={<Check />} />
        <Route path="/record" element={<Record />} />
      </Routes>
    </BrowserRouter>
  );
};


export default App;