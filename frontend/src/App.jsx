import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import CampgroundsIndex from './components/CampgroundsIndex'
import CampgroundShow from './components/CampgroundShow'
import NewCampground from './components/NewCampground'
import EditCampground from './components/EditCampground'
import Login from './components/Login'
import Register from './components/Register'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campgrounds" element={<CampgroundsIndex />} />
          <Route path="/campgrounds/new" element={<NewCampground />} />
          <Route path="/campgrounds/:id" element={<CampgroundShow />} />
          <Route path="/campgrounds/:id/edit" element={<EditCampground />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
