import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await register(email, username, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Registration failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="container py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="row justify-content-center w-100">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="mb-3" style={{ fontSize: '3rem' }}>🌟</div>
                <h2 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Join YelpCamp</h2>
                <p className="text-muted">Start your camping adventure today</p>
              </div>

              {error && (
                <div className="alert alert-danger rounded-3 border-0" role="alert" style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-person-fill text-muted"></i>
                    </span>
                    <input 
                      type="text" 
                      className="form-control border-start-0" 
                      id="username" 
                      placeholder="Choose a username" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-envelope-fill text-muted"></i>
                    </span>
                    <input 
                      type="email" 
                      className="form-control border-start-0" 
                      id="email" 
                      placeholder="Enter your email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-lock-fill text-muted"></i>
                    </span>
                    <input 
                      type="password" 
                      className="form-control border-start-0" 
                      id="password" 
                      placeholder="Create a password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4 pt-4 border-top">
                <p className="text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-success fw-semibold text-decoration-none">
                    Sign in here →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
