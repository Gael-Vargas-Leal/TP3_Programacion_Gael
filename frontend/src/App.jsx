import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import ResourcePage from './pages/ResourcePage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehiculos" element={<ProtectedRoute><ResourcePage key="vehiculos" resource="vehiculos" /></ProtectedRoute>} />
          <Route path="/conductores" element={<ProtectedRoute><ResourcePage key="conductores" resource="conductores" /></ProtectedRoute>} />
          <Route path="/viajes" element={<ProtectedRoute><ResourcePage key="viajes" resource="viajes" /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
