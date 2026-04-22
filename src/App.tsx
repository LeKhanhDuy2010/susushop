import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Equipment from './pages/Equipment';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/equipment" element={<Equipment />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col p-4 md:p-6 space-y-8 max-w-screen-2xl mx-auto">
        <Navbar />
        
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}
