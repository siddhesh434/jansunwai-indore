"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Map, X, Search } from "lucide-react";
import L from "leaflet";

const MapAddressSelector = ({ 
  value, 
  onChange, 
  placeholder = "Search or click on map to select address...",
  showMap,
  onToggleMap,
  jawgApiKey // Accept as prop for better security
}) => {
  // Fallback to environment variable if not passed as prop
  const apiKey = jawgApiKey || process.env.NEXT_PUBLIC_JAWG_API_KEY;
  
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [currentTileLayer, setCurrentTileLayer] = useState('carto'); // 'carto' or 'jawg'
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const tileLayerRef = useRef(null);

  // Fix Leaflet default marker icons
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Fix for default markers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
    }
  }, []);

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (showMap && mapRef.current && !mapInstanceRef.current && typeof window !== "undefined") {
      // Create map
      const map = L.map(mapRef.current, {
        center: [22.7196, 75.8577], // Indore
        zoom: 13,
      });

      // Add initial tile layer (Carto Voyager)
      const cartoLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }
      ).addTo(map);

      tileLayerRef.current = cartoLayer;

      // Handle map clicks for reverse geocoding
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await fetch(
            `/api/query-geocode?type=reverse&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || "Unknown location";
          
          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }
          
          // Add new marker
          markerRef.current = L.marker([lat, lng]).addTo(map).bindPopup(address).openPopup();
          
          // Update input and call onChange
          setInputValue(address);
          onChange?.(address);
          setSuggestions([]);
        } catch (error) {
          console.error("Error in reverse geocoding:", error);
        }
      });

      mapInstanceRef.current = map;

      // Force map to invalidate size after a short delay
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);

      // If there's an existing value, try to geocode it
      if (value) {
        geocodeAddress(value, map);
      }
    }
  }, [showMap, value]);

  // Clean up map when showMap becomes false
  useEffect(() => {
    if (!showMap && mapInstanceRef.current) {
      // Clean up the map instance
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    }
  }, [showMap]);

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Handle map resize when visibility changes
  useEffect(() => {
    if (showMap && mapInstanceRef.current) {
      // Use a timeout to ensure the DOM has updated
      const timeoutId = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showMap]);

  // Function to switch tile layers
  const switchTileLayer = (layerType) => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    // Remove current tile layer
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newLayer;
    if (layerType === 'jawg' && apiKey) {
      // Jawg Streets layer
      newLayer = L.tileLayer(
        `https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${apiKey}`,
        {
          attribution: '<a href="https://www.jawg.io">© Jawg</a> © <a href="https://www.openstreetmap.org/">OSM</a>',
          subdomains: 'abcd',
          maxZoom: 22
        }
      );
    } else {
      // Default to Carto Voyager
      newLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }
      );
      layerType = 'carto'; // Fallback to carto if jawg key is missing
    }

    // Add new layer
    newLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
    setCurrentTileLayer(layerType);
    
    // Invalidate size after layer change
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 50);
  };

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const geocodeAddress = async (address, map) => {
    try {
      const response = await fetch(
        `/api/query-geocode?type=search&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        // Remove existing marker
        if (markerRef.current && map) {
          map.removeLayer(markerRef.current);
        }
        
        // Add new marker
        if (map) {
          markerRef.current = L.marker([latNum, lonNum]).addTo(map).bindPopup(address).openPopup();
          map.setView([latNum, lonNum], 15);
        }
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue); // Update parent immediately
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Clear suggestions if input is empty
    if (newValue.length === 0) {
      setSuggestions([]);
      return;
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      if (newValue.length >= 2) {
        searchAddresses(newValue);
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const searchAddresses = async (query) => {
    setLoading(true);
    setSuggestions([]);
    
    try {
      // Check if it's a 6-digit PIN code
      if (/^\d{6}$/.test(query)) {
        const response = await fetch(`/api/query-geocode?type=pincode&pin=${query}`);
        const data = await response.json();
        
        if (data[0]?.Status === "Success") {
          const pinSuggestions = data[0].PostOffice.map(po => ({
            display: `${po.Name}, ${po.District}, ${po.State}, ${po.Pincode}`,
            type: 'pincode',
            data: po
          }));
          setSuggestions(pinSuggestions);
        } else {
          setSuggestions([{ display: "No PIN code found", type: 'error' }]);
        }
      } else {
        // Regular address search
        const response = await fetch(
          `/api/query-geocode?type=search&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.length > 0) {
          const addressSuggestions = data.map(place => ({
            display: place.display_name,
            type: 'address',
            data: place
          }));
          setSuggestions(addressSuggestions);
        } else {
          setSuggestions([{ display: "No results found", type: 'error' }]);
        }
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
      setSuggestions([{ display: "Error searching addresses", type: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'error') return;
    
    setInputValue(suggestion.display);
    onChange?.(suggestion.display);
    setSuggestions([]);
    
    // If map is shown and we have a map instance, update the map
    if (showMap && mapInstanceRef.current) {
      if (suggestion.type === 'pincode') {
        // For PIN codes, geocode the address
        geocodeAddress(suggestion.display, mapInstanceRef.current);
      } else if (suggestion.type === 'address') {
        // For regular addresses, use the coordinates directly
        const { lat, lon } = suggestion.data;
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        
        // Remove existing marker
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }
        
        // Add new marker
        markerRef.current = L.marker([latNum, lonNum])
          .addTo(mapInstanceRef.current)
          .bindPopup(suggestion.display)
          .openPopup();
        mapInstanceRef.current.setView([latNum, lonNum], 15);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Field */}
      <div className="relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
          />
          {onToggleMap && (
            <button
              type="button"
              onClick={onToggleMap}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors ${
                showMap
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={showMap ? "Hide Map" : "Show Map"}
            >
              {showMap ? <X className="w-4 h-4" /> : <Map className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {(suggestions.length > 0 || loading) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto">
            {loading && (
              <div className="p-3 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  <span>Searching...</span>
                </div>
              </div>
            )}
            
            {!loading && suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`p-3 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  suggestion.type === 'error'
                    ? "text-gray-400 cursor-default"
                    : "cursor-pointer hover:bg-blue-50 text-gray-700"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span className="flex-1">{suggestion.display}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      {showMap && (
        <div className="relative z-0">
          <div 
            ref={mapRef}
            className="h-64 w-full rounded-lg border border-blue-200 bg-gray-100"
            style={{ minHeight: '256px', zIndex: 1 }}
          />
          
          {/* Map Controls */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600 shadow-sm z-10">
            Click on map to select location
          </div>
          
          {/* Tile Layer Switcher */}
          {apiKey && (
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-blue-200">
                <button
                  onClick={() => switchTileLayer('carto')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-l-lg transition-colors ${
                    currentTileLayer === 'carto'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50'
                  }`}
                  title="Carto Voyager (Free)"
                >
                  Voyager
                </button>
                <button
                  onClick={() => switchTileLayer('jawg')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-r-lg transition-colors ${
                    currentTileLayer === 'jawg'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-50'
                  } border-l border-blue-200`}
                  title="Jawg Streets"
                >
                  Jawg
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Address Display */}
      {inputValue && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-800 font-medium">Selected Address:</p>
              <p className="text-sm text-blue-700 break-words">{inputValue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapAddressSelector;