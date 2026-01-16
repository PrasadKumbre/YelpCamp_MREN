import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function CampgroundShow() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campground, setCampground] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('view')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [currentPage, setCurrentPage] = useState(0)
  const reviewsPerPage = 3
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchCampground()
  }, [id])

  useEffect(() => {
    if (campground && mapContainer.current && !mapRef.current) {
      initializeMap()
    }
  }, [campground])

  const fetchCampground = async () => {
    try {
      const response = await fetch(`/api/campgrounds/${id}`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setCampground(data.data)
      }
    } catch (error) {
      console.error('Error fetching campground:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeMap = () => {
    if (window.maptilersdk) {
      if (!campground || !campground.geometry || !campground.geometry.coordinates) {
        console.warn("Invalid campground geometry")
        if (mapContainer.current) {
          mapContainer.current.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%"><p>Map location not available</p></div>'
        }
        return
      }

      const maptilersdk = window.maptilersdk
      maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || ''

      const map = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: campground.geometry.coordinates,
        zoom: 13
      })

      new maptilersdk.Marker()
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
          new maptilersdk.Popup({ offset: 25 })
            .setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`)
        )
        .addTo(map)

      mapRef.current = map
    } else {
      const script = document.createElement('script')
      script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.umd.min.js'
      script.onload = () => {
        setTimeout(initializeMap, 100)
      }
      document.head.appendChild(script)

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css'
      document.head.appendChild(link)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/campgrounds/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          review: {
            body: reviewBody.trim(),
            rating: reviewRating
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setReviewBody('')
        setReviewRating(5)
        setActiveTab('view')
        fetchCampground() // Refresh campground data
      } else {
        alert(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/campgrounds/${id}/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        fetchCampground() // Refresh campground data
      } else {
        alert(data.error || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Failed to delete review')
    }
  }

  const handleDeleteCampground = async () => {
    if (!window.confirm('Are you sure you want to delete this campground?')) return

    try {
      const response = await fetch(`/api/campgrounds/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        navigate('/campgrounds')
      } else {
        alert(data.error || 'Failed to delete campground')
      }
    } catch (error) {
      console.error('Error deleting campground:', error)
      alert('Failed to delete campground')
    }
  }

  const getDisplayedReviews = () => {
    if (!campground?.reviews) return []
    const start = currentPage * reviewsPerPage
    return campground.reviews.slice(start, start + reviewsPerPage)
  }

  const totalPages = campground?.reviews ? Math.ceil(campground.reviews.length / reviewsPerPage) : 0

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!campground) {
    return (
      <div className="container text-center my-5">
        <h2>Campground not found</h2>
        <Link to="/campgrounds" className="btn btn-primary">Back to Campgrounds</Link>
      </div>
    )
  }

  const isAuthor = user && campground.author._id === user._id

  return (
    <div className="container py-5">
      {/* Title */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3" style={{ color: '#1e293b' }}>
          {campground.title}
        </h1>
        <p className="lead text-muted">
          <i className="bi bi-geo-alt-fill me-2 text-success"></i>
          {campground.location}
        </p>
      </div>

      {/* Map and Carousel */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          {/* Image Carousel */}
          <div id="carouselExampleFade" className="carousel slide carousel-fade shadow-sm rounded-4">
            <div className="carousel-inner">
              {campground.images.map((image, i) => (
                <div key={i} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
                  <img
                    crossOrigin="anonymous"
                    src={image.url}
                    className="d-block w-100"
                    alt="Campground Image"
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
            {campground.images.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleFade" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="col-md-6">
          {/* Detail Card */}
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body p-4">
              <h4 className="card-title fw-bold mb-4" style={{ color: '#1e293b' }}>
                <i className="bi bi-info-circle-fill me-2 text-success"></i>Campground Info
              </h4>
              <p className="text-muted mb-3">
                {campground.description}
              </p>
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                  <i className="bi bi-cash-coin me-3 text-success" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <div className="text-muted small">Price</div>
                    <div className="fw-bold fs-5 text-success">₹{campground.price}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                  <i className="bi bi-person-fill me-3 text-success" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <div className="text-muted small">Creator</div>
                    <div className="fw-bold">{campground.author.username}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center p-3 rounded-3" style={{ background: '#f8fafc' }}>
                  <i className="bi bi-calendar-event-fill me-3 text-success" style={{ fontSize: '1.5rem' }}></i>
                  <div>
                    <div className="text-muted small">Created</div>
                    <div className="fw-bold">
                      {campground.createdAt ? new Date(campground.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {isAuthor && (
                <div className="d-grid gap-2 mt-4">
                  <Link
                    to={`/campgrounds/${campground._id}/edit`}
                    className="btn btn-outline-success"
                  >
                    <i className="bi bi-pencil-fill me-2"></i>Edit Campground
                  </Link>
                  <button
                    onClick={handleDeleteCampground}
                    className="btn btn-outline-danger"
                  >
                    <i className="bi bi-trash-fill me-2"></i>Delete Campground
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details + Reviews */}
      <div className="row g-4">
        {/* Reviews Section */}
        <div className="col-md-6">
          {user ? (
            <>
              {/* Tabs */}
              <ul className="nav nav-pills mb-4" role="tablist" style={{ borderBottom: '2px solid #e2e8f0' }}>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link rounded-pill me-2 ${activeTab === 'view' ? 'active' : ''}`}
                    onClick={() => setActiveTab('view')}
                    type="button"
                    style={activeTab === 'view' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' } : {}}
                  >
                    <i className="bi bi-eye-fill me-1"></i> View Reviews
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link rounded-pill ${activeTab === 'write' ? 'active' : ''}`}
                    onClick={() => setActiveTab('write')}
                    type="button"
                    style={activeTab === 'write' ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' } : {}}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Write Review
                  </button>
                </li>
              </ul>

              {/* View Reviews Tab */}
              {activeTab === 'view' && (
                <div>
                  {!campground.reviews || campground.reviews.length === 0 ? (
                    <div className="alert alert-info">No reviews yet.</div>
                  ) : (
                    <>
                      <div className="reviews-wrapper">
                        {getDisplayedReviews().map((review) => (
                          <div key={review._id} className="card border-0 shadow-sm mb-3 review-card" style={{ borderLeft: '4px solid #10b981 !important' }}>
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <div className="mb-2">
                                    <span className="badge bg-warning text-dark px-3 py-2">
                                      ⭐ {review.rating} {review.rating === 1 ? 'Star' : 'Stars'}
                                    </span>
                                  </div>
                                  <h6 className="text-muted mb-0 fw-semibold">
                                    <i className="bi bi-person-circle me-2"></i>{review.author.username}
                                  </h6>
                                </div>
                                {user && review.author._id === user._id && (
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="btn btn-sm btn-outline-danger rounded-pill"
                                  >
                                    <i className="bi bi-trash-fill me-1"></i>Delete
                                  </button>
                                )}
                              </div>
                              <p className="card-text mb-0" style={{ color: '#475569', lineHeight: '1.7' }}>
                                {review.body}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {campground.reviews.length > reviewsPerPage && (
                        <div className="d-flex justify-content-center mt-3">
                          <button
                            className="btn btn-outline-primary me-2"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                          >
                            Previous
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage >= totalPages - 1}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Write Review Tab */}
              {activeTab === 'write' && (
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-4">
                    <h4 className="mb-4 fw-bold text-center" style={{ color: '#1e293b' }}>
                      <i className="bi bi-chat-square-dots-fill me-2 text-success"></i> Leave a Review
                    </h4>
                    <form onSubmit={handleReviewSubmit}>
                      <div className="mb-4">
                        <label className="form-label fw-semibold mb-3">Rating</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              className={`btn ${reviewRating === rating ? 'btn-warning' : 'btn-outline-warning'} rounded-pill px-4`}
                              onClick={() => setReviewRating(rating)}
                              style={reviewRating === rating ? { transform: 'scale(1.05)' } : {}}
                            >
                              {rating} ⭐
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="body" className="form-label fw-semibold">Your Review</label>
                        <textarea
                          className="form-control shadow-sm rounded-3"
                          id="body"
                          rows="4"
                          required
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                        ></textarea>
                      </div>

                      <div className="d-grid mt-4">
                        <button type="submit" className="btn btn-success btn-lg py-3">
                          <i className="bi bi-send-fill me-2"></i>Submit Review
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <h4 className="mb-4 fw-bold" style={{ color: '#1e293b' }}>
                <i className="bi bi-star-fill me-2 text-warning"></i>Reviews
              </h4>
              {!campground.reviews || campground.reviews.length === 0 ? (
                <div className="alert alert-info border-0 rounded-3">No reviews yet. Be the first to review!</div>
              ) : (
                <>
                  <div className="reviews-wrapper">
                    {getDisplayedReviews().map((review) => (
                      <div key={review._id} className="card border-0 shadow-sm mb-3 review-card" style={{ borderLeft: '4px solid #10b981 !important' }}>
                        <div className="card-body p-4">
                          <div className="mb-3">
                            <span className="badge bg-warning text-dark px-3 py-2 mb-2">
                              ⭐ {review.rating} {review.rating === 1 ? 'Star' : 'Stars'}
                            </span>
                            <h6 className="text-muted mb-0 fw-semibold mt-2">
                              <i className="bi bi-person-circle me-2"></i>{review.author.username}
                            </h6>
                          </div>
                          <p className="card-text mb-0" style={{ color: '#475569', lineHeight: '1.7' }}>
                            {review.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {campground.reviews.length > reviewsPerPage && (
                    <div className="d-flex justify-content-center mt-3">
                      <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Map Section */}
        <div className="col-md-6">
          <h4 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
            <i className="bi bi-geo-alt-fill me-2 text-success"></i> Location on Map
          </h4>
          <div
            ref={mapContainer}
            id="map"
            className="shadow-lg border-0 rounded-4"
            style={{ width: '100%', height: '400px' }}
          ></div>
        </div>
      </div>

    </div>
  )
}

export default CampgroundShow
