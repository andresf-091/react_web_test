import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Check from './components/Check/Check';
import Record from './components/Record/Record';
import Download from './components/Download/Download';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/check" element={<Check />} />
        <Route path="/record" element={<Record />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </BrowserRouter>
  );
};


export default App;