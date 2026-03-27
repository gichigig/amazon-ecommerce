import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LocationModal({ counties, selectedLocation, onSelect, onClose, isLoggedIn }) {
  const [selectedCounty, setSelectedCounty] = useState(selectedLocation)

  const handleDone = () => {
    onSelect(selectedCounty)
  }

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={e => e.stopPropagation()}>
        <div className="location-modal-header">
          <h2>Choose your location</h2>
          <button className="location-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="location-modal-content">
          <p className="location-modal-info">
            Delivery options and delivery speeds may vary for different locations
          </p>

          {!isLoggedIn && (
            <Link to="/login" className="location-signin-btn" onClick={onClose}>
              Sign in to see your addresses
            </Link>
          )}

          {isLoggedIn && (
            <div className="location-addresses">
              <p className="location-addresses-label">Your saved addresses:</p>
              <div className="location-address-item">
                <input type="radio" name="address" id="addr1" defaultChecked />
                <label htmlFor="addr1">Default Address - Nairobi</label>
              </div>
            </div>
          )}

          <div className="location-divider">
            <span>or</span>
          </div>

          <p className="location-ship-outside">Ship outside Nairobi</p>

          <select 
            className="location-county-select"
            value={selectedCounty}
            onChange={(e) => setSelectedCounty(e.target.value)}
          >
            {counties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>

          <button className="location-done-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
