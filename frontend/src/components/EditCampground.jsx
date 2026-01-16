import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import API_BASE_URL from '../config'

function EditCampground() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [campground, setCampground] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    price: ''
  })
  const [newImages, setNewImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [deleteImages, setDeleteImages] = useState([])

  useEffect(() => {
    fetchCampground()
  }, [id])

  useEffect(() => {
    if (campground) {
      setFormData({
        title: campground.title || '',
        location: campground.location || '',
        description: campground.description || '',
        price: campground.price || ''
      })
    }
  }, [campground])

  useEffect(() => {
    if (!user || (campground && campground.author._id !== user._id)) {
      navigate('/campgrounds')
    }
  }, [user, campground, navigate])

  const fetchCampground = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campgrounds/${id}`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setCampground(data.data)
      } else {
        navigate('/campgrounds')
      }
    } catch (error) {
      console.error('Error fetching campground:', error)
      navigate('/campgrounds')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(files)

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

  const handleDeleteImage = (filename) => {
    setDeleteImages(prev => {
      if (prev.includes(filename)) {
        return prev.filter(f => f !== filename)
      } else {
        return [...prev, filename]
      }
    })
  }

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
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('campground[title]', formData.title)
      formDataToSend.append('campground[location]', formData.location)
      formDataToSend.append('campground[description]', formData.description)
      formDataToSend.append('campground[price]', formData.price)

      newImages.forEach((image) => {
        formDataToSend.append('image', image)
      })

      if (deleteImages.length > 0) {
        deleteImages.forEach((filename) => {
          formDataToSend.append('deleteImages[]', filename)
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/campgrounds/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      })

      const data = await response.json()

      if (data.success) {
        navigate(`/campgrounds/${id}`)
      } else {
        setError(data.error || 'Failed to update campground')
      }
    } catch (error) {
      console.error('Error updating campground:', error)
      setError('Failed to update campground. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!campground || !user) {
    return null
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <div className="mb-3" style={{ fontSize: '3rem' }}>✏️</div>
            <h1 className="display-5 fw-bold mb-2" style={{ color: '#1e293b' }}>Edit Campground</h1>
            <p className="lead text-muted">Update your campground information</p>
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

                {campground.images && campground.images.length > 0 && (
                  <div className="mb-3">
                    <h5 className="mb-3">Current Images</h5>
                    <div className="d-flex flex-wrap gap-3">
                      {campground.images.map((image, i) => {
                        const isMarkedForDelete = deleteImages.includes(image.filename)
                        return (
                          <div key={i} className="position-relative">
                            <img
                              src={image.thumbnail || image.url}
                              className={`img-thumbnail rounded-3 ${isMarkedForDelete ? 'opacity-50 border-danger' : ''}`}
                              alt={`Campground ${i + 1}`}
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <div className="form-check position-absolute top-0 end-0 m-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`image-${i}`}
                                checked={isMarkedForDelete}
                                onChange={() => handleDeleteImage(image.filename)}
                              />
                              <label className="form-check-label text-white bg-dark rounded px-1" htmlFor={`image-${i}`}>
                                Delete
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label" htmlFor="image">Add New Images</label>
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
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="valid-feedback">Looks good!</div>
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
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>Update Campground
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

export default EditCampground
