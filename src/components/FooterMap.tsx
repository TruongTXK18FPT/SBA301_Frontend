import React, { useState } from 'react';
import { FiMap, FiMapPin } from 'react-icons/fi';
import '../styles/Footer.css';

const FooterMap: React.FC = () => {
  const [showMap, setShowMap] = useState(false);

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="map-section">
      <button 
        className="map-toggle-button"
        onClick={toggleMap}
        aria-label={showMap ? "Hide map" : "Show map"}
      >
        {showMap ? <FiMapPin /> : <FiMap />}
        {showMap ? 'Hide Map' : 'Show Map'}
      </button>
      
      {showMap && (
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.609941531757!2d106.80730807460242!3d10.841127089298729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1709653645885!5m2!1sen!2s"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="FPT University Location"
          />
        </div>
      )}
    </div>
  );
};

export default FooterMap; 