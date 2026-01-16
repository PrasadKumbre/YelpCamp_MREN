import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API_BASE_URL from '../config'

function NewCampground() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    price: ''
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)

    // Clean up old previews
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview))

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const form = e.currentTarget
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    form.classList.add('was-validated')
    setError('')
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('campground[title]', formData.title)
      formDataToSend.append('campground[location]', formData.location)
      formDataToSend.append('campground[description]', formData.description)
      formDataToSend.append('campground[price]', formData.price)

      images.forEach((image) => {
        formDataToSend.append('image', image)
      })

      const response = await fetch(`${API_BASE_URL}/api/campgrounds`, {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      })

      const data = await response.json()

      if (data.success) {
        navigate(`/campgrounds/${data.data._id}`)
      } else {
        setError(data.error || 'Failed to create campground')
      }
    } catch (error) {
      console.error('Error creating campground:', error)
      setError('Failed to create campground. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>🏕️</div>
            <h1 className="display-5 fw-bold mb-2" style={{ color: '#1e293b' }}>Create New Campground</h1>
            <p className="lead text-muted">Share your favorite camping spot with the community</p>
          </div>
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5">
              {error && (
                <div className="alert alert-danger rounded-3 border-0 mb-4" role="alert" style={{ background: '#fee2e2', color: '#991b1b' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="validated-form" noValidate>
                <div className="mb-3">
                  <label className="form-label" htmlFor="title">Title</label>
                  <input
                    className="form-control rounded-3"
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  <div className="valid-feedback">Looks good!</div>
                  <div className="invalid-feedback">Please provide a title.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input
                    className="form-control rounded-3"
                    type="text"
                    name="location"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                  <div className="invalid-feedback">Please provide a location.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="image">Add Images</label>
                  {imagePreviews.length > 0 && (
                    <div className="mt-3 d-flex flex-wrap gap-3 mb-3">
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="img-thumbnail rounded-3"
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  )}
                  <input
                    className="form-control rounded-3"
                    type="file"
                    name="image"
                    id="image"
                    required
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="valid-feedback">Looks good!</div>
                  <div className="invalid-feedback">Please select at least one image.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    className="form-control rounded-3"
                    name="description"
                    id="description"
                    rows="5"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  <div className="valid-feedback">Looks good!</div>
                  <div className="invalid-feedback">Please provide a description.</div>
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="price">Price</label>
                  <div className="input-group has-validation">
                    <span className="input-group-text rounded-start-3">₹</span>
                    <input
                      type="number"
                      className="form-control rounded-end-3"
                      id="price"
                      placeholder="0.00"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                    <div className="valid-feedback">Looks good!</div>
                    <div className="invalid-feedback">Please provide a valid price.</div>
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>Create Campground
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewCampground
