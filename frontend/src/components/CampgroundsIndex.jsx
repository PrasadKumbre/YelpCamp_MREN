import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../config'

function CampgroundsIndex() {
  const [campgrounds, setCampgrounds] = useState([])
  const [loading, setLoading] = useState(true)
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchCampgrounds()
  }, [])

  useEffect(() => {
    if (campgrounds.length > 0 && mapContainer.current && !mapRef.current) {
      initializeMap()
    }
  }, [campgrounds])

  const fetchCampgrounds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/campgrounds`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setCampgrounds(data.data)
      }
    } catch (error) {
      console.error('Error fetching campgrounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeMap = () => {
    if (window.maptilersdk) {
      const maptilersdk = window.maptilersdk
      maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY || ''

      const validCampgrounds = campgrounds.filter(c => c.geometry && c.geometry.coordinates)

      if (validCampgrounds.length === 0) {
        console.warn('No campgrounds with valid geometry found')
        return
      }

      const geoJsonData = {
        type: 'FeatureCollection',
        features: validCampgrounds.map(campground => ({
          type: 'Feature',
          geometry: campground.geometry,
          properties: {
            popUpMarkup: `<strong><a href='/campgrounds/${campground._id}'>${campground.title}</a></strong><p>${campground.description.substring(0, 20)}....</p>`
          }
        }))
      }

      const map = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.DATAVIZ.DARK,
        center: [75.7139, 19.7515],
        zoom: 4
      })

      map.on('load', function () {
        map.addSource('campgrounds', {
          type: 'geojson',
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        })

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'campgrounds',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#00BCD4',
              10,
              '#2196F3',
              30,
              '#3F51B5'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              15,
              10,
              20,
              30,
              25
            ]
          }
        })

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'campgrounds',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        })

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'campgrounds',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        })

        map.on('click', 'clusters', async (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          })
          const clusterId = features[0].properties.cluster_id
          const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId)
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom
          })
        })

        map.on('click', 'unclustered-point', function (e) {
          const { popUpMarkup } = e.features[0].properties
          const coordinates = e.features[0].geometry.coordinates.slice()

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
          }

          new maptilersdk.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map)
        })

        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = ''
        })
      })

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

  if (loading) {
    return (
      <div className="container text-center my-5 py-5">
        <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading campgrounds...</p>
      </div>
    )
  }

  return (
    <div className="container py-5">
      {/* Map Section */}
      <div className="mb-5">
        <div className="text-center mb-4">
          <h1 className="display-4 fw-bold mb-2">🗺️ Campgrounds Map</h1>
          <p className="lead text-muted">Browse all locations across the country</p>
        </div>
        <div
          ref={mapContainer}
          id="map"
          className="rounded-4 shadow-lg border-0"
          style={{
            width: '100%',
            height: '500px',
            background: 'linear-gradient(135deg, #e0f7fa 0%, #f0f0f0 100%)'
          }}
        ></div>
      </div>

      {/* Page Title */}
      <div className="text-center mb-5 py-4">
        <h2 className="display-5 fw-bold mb-2">🏕️ Explore Campgrounds</h2>
        <p className="lead text-muted">Discover your next adventure</p>
      </div>

      {/* Campgrounds List */}
      {campgrounds.length === 0 ? (
        <div className="text-center py-5">
          <div className="card border-0 shadow-sm p-5">
            <h3 className="text-muted">No campgrounds found</h3>
            <p className="text-muted">Be the first to add a campground!</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {campgrounds.map((campground) => (
            <div key={campground._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-md overflow-hidden">
                <div className="position-relative" style={{ height: '250px', overflow: 'hidden' }}>
                  <img
                    crossOrigin="anonymous"
                    src={campground.images[0]?.url || 'https://via.placeholder.com/400x300'}
                    alt={`${campground.title}`}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-success px-3 py-2" style={{ fontSize: '0.9rem' }}>
                      ₹{campground.price}
                    </span>
                  </div>
                </div>
                <div className="card-body p-4">
                  <h4 className="card-title fw-bold mb-3" style={{ color: '#1e293b', minHeight: '3rem' }}>
                    {campground.title}
                  </h4>
                  <p className="card-text text-muted mb-3" style={{
                    minHeight: '3rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {campground.description.length > 100
                      ? campground.description.substring(0, 100) + '...'
                      : campground.description}
                  </p>
                  <div className="mb-3">
                    <span className="badge bg-light text-dark px-3 py-2">
                      📍 {campground.location}
                    </span>
                  </div>
                  <Link
                    to={`/campgrounds/${campground._id}`}
                    className="btn btn-success w-100 rounded-3 py-2"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CampgroundsIndex
