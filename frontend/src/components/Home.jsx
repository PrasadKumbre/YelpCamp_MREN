import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      {/* Hero Carousel Section */}
      <div id="heroCarousel" className="carousel slide hero-carousel" data-bs-ride="carousel" style={{ position: 'relative' }}>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img 
              crossOrigin="anonymous" 
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
              className="d-block w-100" 
              alt="Campground 1"
              style={{ height: '100vh', objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="carousel-caption text-center fade-in">
              <h1 className="display-2 fw-bold mb-4" style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: 'clamp(2rem, 5vw, 4rem)'
              }}>
                Welcome to YelpCamp
              </h1>
              <p className="lead mb-4" style={{ 
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                Find and review the best camping spots on Earth. Plan your adventure today!
              </p>
              <Link to="/campgrounds" className="btn btn-success btn-lg mt-3 px-5 py-3" style={{ fontSize: '1.1rem' }}>
                Explore Campgrounds →
              </Link>
            </div>
          </div>
          <div className="carousel-item">
            <img 
              crossOrigin="anonymous" 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80"
              className="d-block w-100" 
              alt="Campground 2"
              style={{ height: '100vh', objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="carousel-caption text-center fade-in">
              <h1 className="display-2 fw-bold mb-4" style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: 'clamp(2rem, 5vw, 4rem)'
              }}>
                Camp Under the Stars
              </h1>
              <p className="lead mb-4" style={{ 
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                Experience unforgettable nights surrounded by nature's beauty.
              </p>
              <Link to="/campgrounds" className="btn btn-success btn-lg mt-3 px-5 py-3" style={{ fontSize: '1.1rem' }}>
                Start Exploring →
              </Link>
            </div>
          </div>
          <div className="carousel-item">
            <img 
              crossOrigin="anonymous" 
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1920&q=80"
              className="d-block w-100" 
              alt="Campground 3"
              style={{ height: '100vh', objectFit: 'cover', filter: 'brightness(0.6)' }}
            />
            <div className="carousel-caption text-center fade-in">
              <h1 className="display-2 fw-bold mb-4" style={{ 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: 'clamp(2rem, 5vw, 4rem)'
              }}>
                Nature Awaits You
              </h1>
              <p className="lead mb-4" style={{ 
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>
                From forests to rivers, your next favorite campsite is just a click away.
              </p>
              <Link to="/campgrounds" className="btn btn-success btn-lg mt-3 px-5 py-3" style={{ fontSize: '1.1rem' }}>
                Browse Locations →
              </Link>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Features Section */}
      <section className="features py-5" style={{ 
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
        position: 'relative'
      }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3" style={{ color: '#1e293b' }}>
              Why Choose YelpCamp?
            </h2>
            <p className="lead text-muted">Discover amazing camping experiences worldwide</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center border-0">
                <div className="feature-icon mb-3" style={{ fontSize: '4rem' }}>🌍</div>
                <h4 className="card-title fw-bold mb-3">Explore Worldwide</h4>
                <p className="card-text text-muted">
                  From forests to beaches to mountains — find campgrounds anywhere on Earth.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center border-0">
                <div className="feature-icon mb-3" style={{ fontSize: '4rem' }}>⭐</div>
                <h4 className="card-title fw-bold mb-3">Read Real Reviews</h4>
                <p className="card-text text-muted">
                  Get honest feedback from real campers before you book your trip.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card feature-card h-100 p-4 text-center border-0">
                <div className="feature-icon mb-3" style={{ fontSize: '4rem' }}>📝</div>
                <h4 className="card-title fw-bold mb-3">Share Your Story</h4>
                <p className="card-text text-muted">
                  Visited a campsite? Share your experience and help others enjoy the outdoors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white', 
        padding: '2.5rem 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <p className="mb-0" style={{ fontSize: '1rem', opacity: 0.9 }}>
            &copy; {new Date().getFullYear()} YelpCamp. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}

export default Home
