import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-lg sticky-top" style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" style={{ 
          fontSize: '1.5rem',
          color: '#10b981',
          textDecoration: 'none'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"
            className="bi bi-tree-fill me-2" viewBox="0 0 16 16" style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))' }}>
            <path
              d="M8 0c.256 0 .512.098.707.293l3 3a1 1 0 0 1-.707 1.707H9.586l2.354 2.354a1 1 0 0 1-1.414 1.414L8 6.414l-2.525 2.525a1 1 0 0 1-1.414-1.414L6.414 5H5a1 1 0 0 1-.707-1.707l3-3A1 1 0 0 1 8 0z" />
            <path
              d="M7.5 8.914V13H6a.5.5 0 0 0 0 1h1.5v.5a.5.5 0 0 0 1 0V14H10a.5.5 0 0 0 0-1H8.5V8.914l1.793 1.793a.5.5 0 0 0 .707-.707l-2.5-2.5a.5.5 0 0 0-.707 0l-2.5 2.5a.5.5 0 0 0 .707.707L7.5 8.914z" />
          </svg>
          <span style={{ letterSpacing: '-0.5px' }}>YelpCamp</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
          aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav ms-auto align-items-center">
            <Link className="nav-link px-3 py-2" to="/" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Home
            </Link>
            <Link className="nav-link px-3 py-2" to="/campgrounds" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Campgrounds
            </Link>
            {user && (
              <Link className="nav-link px-3 py-2" to="/campgrounds/new" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <i className="bi bi-plus-circle me-1"></i>New Campground
              </Link>
            )}
            {!user ? (
              <>
                <Link className="nav-link px-3 py-2" to="/login" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Login
                </Link>
                <Link 
                  className="btn btn-success rounded-pill px-4 ms-2" 
                  to="/register"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="dropdown ms-2">
                <button 
                  className="btn btn-outline-light rounded-pill px-3 dropdown-toggle" 
                  type="button" 
                  data-bs-toggle="dropdown"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" style={{ borderRadius: '0.75rem' }}>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleLogout}
                      style={{ fontWeight: 500 }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
