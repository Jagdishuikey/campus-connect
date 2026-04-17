import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setPage } from '../store/uiSlice'
import { pgAPI } from '../services/api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom icon for PG markers
const pgIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component to fly the map to a location
const FlyToLocation = ({ position, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom || 15, { duration: 1.2 })
    }
  }, [position, zoom, map])
  return null
}

// Amenity icon mapping
const amenityIcons = {
  WiFi: '📶', AC: '❄️', Laundry: '🧺', Parking: '🅿️', Mess: '🍽️',
  CCTV: '📹', Gym: '💪', Kitchen: '🍳', 'Power Backup': '🔋',
  'Swimming Pool': '🏊', 'Coworking Space': '💻',
}

// Type badge colors
const typeBadge = {
  pg: { label: 'PG', color: 'var(--accent-violet)' },
  hostel: { label: 'Hostel', color: 'var(--accent-cyan)' },
  flat: { label: 'Flat', color: 'var(--accent-emerald)' },
}

// Gender badge
const genderBadge = {
  male: { label: '♂ Boys', color: 'rgba(19, 39, 65, 0.8)' },
  female: { label: '♀ Girls', color: 'rgba(244,114,182,0.8)' },
  unisex: { label: '⚥ Unisex', color: 'rgba(167,139,250,0.8)' },
}

// Star rating renderer
const StarRating = ({ rating }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={{ color: i <= Math.round(rating) ? 'var(--accent-amber)' : 'var(--text-muted)', fontSize: '0.85rem' }}>★</span>
    )
  }
  return <span style={{ display: 'inline-flex', gap: '1px' }}>{stars} <span style={{ marginLeft: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rating.toFixed(1)}</span></span>
}

const Hostels = () => {
  const dispatch = useDispatch()
  const [pgs, setPgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterGender, setFilterGender] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPgId, setSelectedPgId] = useState(null)
  const markerRefs = useRef({})

  // Default center (Akurdi, Pune)
  const defaultCenter = [18.6492, 73.7707]

  // Fetch PGs
  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true)
        const data = await pgAPI.getAll()
        setPgs(data.pgs || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPGs()
  }, [])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude])
        },
        () => {
          // Silently fall back to default center
          setUserLocation(null)
        }
      )
    }
  }, [])

  // Filter PGs
  const filteredPGs = pgs.filter(pg => {
    if (filterType !== 'all' && pg.type !== filterType) return false
    if (filterGender !== 'all' && pg.gender !== filterGender) return false
    if (searchQuery && !pg.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Handle list item click
  const handlePgClick = useCallback((pg) => {
    setFlyTo([pg.location.lat, pg.location.lng])
    setSelectedPgId(pg._id)
    // Open the marker popup
    setTimeout(() => {
      const marker = markerRefs.current[pg._id]
      if (marker) marker.openPopup()
    }, 1300)
    // Scroll to map
    document.getElementById('hostels-map-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const mapCenter = userLocation || defaultCenter

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-title-section animate-fade-in">
        <div className="page-title-row">
          <div>
            <div className="page-icon">🏘️</div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>PG / Hostels Finder</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
              Find nearby PGs, hostels &amp; flats on the map
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-glass">{filteredPGs.length} found</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="search-filter-row " style={{ position: 'relative', zIndex: 1 }}>
        <input
          type="text"
          className="glass-input"
          placeholder="🔍 Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '280px' }}
        />
        <select
          className="glass-input"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ maxWidth: '150px' }}
        >
          <option value="all">All Types</option>
          <option value="pg">PG</option>
          <option value="hostel">Hostel</option>
          <option value="flat">Flat</option>
        </select>
        <select
         
          className="glass-input"
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          style={{ maxWidth: '150px' }}
        >
          <option value="all">All Genders</option>
          <option value="male">Boys</option>
          <option value="female">Girls</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      {/* Map Section */}
      <section id="hostels-map-section" className="glass-card hostels-map-container" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div className="hostels-loading">
            <div className="hostels-spinner" />
            <p>Loading map...</p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {flyTo && <FlyToLocation position={flyTo} zoom={16} />}

            {/* User location marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                    <strong style={{ color: '#1a1a2e' }}>📍 You are here</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* PG markers */}
            {filteredPGs.map(pg => (
              <Marker
                key={pg._id}
                position={[pg.location.lat, pg.location.lng]}
                icon={pgIcon}
                ref={(ref) => { if (ref) markerRefs.current[pg._id] = ref }}
              >
                <Popup maxWidth={280} minWidth={220}>
                  <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: '999px', color: '#fff',
                        background: typeBadge[pg.type]?.color || 'var(--accent-violet)',
                      }}>
                        {typeBadge[pg.type]?.label || 'PG'}
                      </span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: '999px', color: '#fff',
                        background: genderBadge[pg.gender]?.color || 'grey',
                      }}>
                        {genderBadge[pg.gender]?.label || pg.gender}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e' }}>{pg.name}</h3>
                    <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#6b7280' }}>{pg.location.address}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#8b5cf6' }}>₹{pg.price?.toLocaleString()}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#9ca3af' }}>/mo</span></span>
                      <span style={{ fontSize: '0.8rem' }}>{'★'.repeat(Math.round(pg.rating))}{'☆'.repeat(5 - Math.round(pg.rating))} <span style={{ color: '#6b7280' }}>{pg.rating}</span></span>
                    </div>
                    {pg.amenities?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {pg.amenities.slice(0, 4).map(a => (
                          <span key={a} style={{
                            fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px',
                            background: '#f3f4f6', color: '#374151',
                          }}>
                            {amenityIcons[a] || '✓'} {a}
                          </span>
                        ))}
                        {pg.amenities.length > 4 && (
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', color: '#9ca3af' }}>
                            +{pg.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                    {pg.contact && (
                      <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>📞 {pg.contact}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="glass-card" style={{ padding: '1rem', margin: '1rem 0', borderColor: 'rgba(251,113,133,0.3)', position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'var(--accent-rose)', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {/* PG List */}
      <section style={{ position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          📋 All Listings
        </h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card hostels-skeleton" style={{ height: '180px' }} />
            ))}
          </div>
        ) : filteredPGs.length === 0 ? (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', margin: '0 0 0.5rem' }}>🏠</p>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No PGs/hostels found matching your filters.</p>
          </div>
        ) : (
          <div className="hostels-grid">
            {filteredPGs.map(pg => (
              <button
                key={pg._id}
                className={`glass-card hostels-card ${selectedPgId === pg._id ? 'hostels-card-active' : ''}`}
                onClick={() => handlePgClick(pg)}
              >
                {/* Card header */}
                <div className="hostels-card-header">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="hostels-type-badge" style={{ background: typeBadge[pg.type]?.color }}>
                      {typeBadge[pg.type]?.label || 'PG'}
                    </span>
                    <span className="hostels-type-badge" style={{ background: genderBadge[pg.gender]?.color }}>
                      {genderBadge[pg.gender]?.label || pg.gender}
                    </span>
                  </div>
                  <span className="hostels-price">
                    ₹{pg.price?.toLocaleString()}<span className="hostels-price-period">/mo</span>
                  </span>
                </div>

                {/* Name & address */}
                <h3 className="hostels-card-name">{pg.name}</h3>
                <p className="hostels-card-address">📍 {pg.location.address}</p>

                {/* Rating */}
                <div style={{ margin: '0.4rem 0' }}>
                  <StarRating rating={pg.rating} />
                </div>

                {/* Amenities */}
                {pg.amenities?.length > 0 && (
                  <div className="hostels-amenities">
                    {pg.amenities.map(a => (
                      <span key={a} className="hostels-amenity-chip">
                        {amenityIcons[a] || '✓'} {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contact */}
                {pg.contact && (
                  <p className="hostels-card-contact">📞 {pg.contact}</p>
                )}

                {/* View on map hint */}
                <div className="hostels-view-map-hint">
                  📍 Click to view on map →
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Hostels