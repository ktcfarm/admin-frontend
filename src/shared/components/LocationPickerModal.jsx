import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { SearchBar } from './SearchBar.jsx';
import { Button } from './Button.jsx';

const INDIA_CENTER = Object.freeze({ lat: 22.9734, lng: 78.6569 });

function roundCoord(value) {
  return Number(Number(value).toFixed(6));
}

function normalizePosition(pos) {
  if (
    pos &&
    pos.lat !== undefined &&
    pos.lng !== undefined &&
    pos.lat !== '' &&
    pos.lng !== ''
  ) {
    const lat = Number(pos.lat);
    const lng = Number(pos.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat: roundCoord(lat), lng: roundCoord(lng), hasInitial: true };
    }
  }
  return { lat: INDIA_CENTER.lat, lng: INDIA_CENTER.lng, hasInitial: false };
}

function createPinIcon() {
  return L.divIcon({
    className: 'ktc-map-pin-icon',
    html: '<div style="width:28px;height:28px;border-radius:9999px 9999px 9999px 0;background:#0E4B2E;border:3px solid #ffffff;box-shadow:0 4px 10px rgba(0,0,0,0.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:9999px;background:#FACC15;transform:rotate(45deg);"></div></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

function MapInteractionHandler({ onSelectPosition }) {
  useMapEvents({
    click(event) {
      onSelectPosition({
        lat: roundCoord(event.latlng.lat),
        lng: roundCoord(event.latlng.lng)
      });
    }
  });
  return null;
}

function MapViewController({ targetView }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (targetView && targetView.lat !== undefined && targetView.lng !== undefined) {
      map.flyTo([targetView.lat, targetView.lng], targetView.zoom || 14, {
        duration: 0.7
      });
    }
  }, [map, targetView]);

  return null;
}

function formatNominatimAddress(item) {
  if (!item) return null;
  const addr = item.address || {};
  return {
    displayName: item.display_name || '',
    cityOrTown: addr.city || addr.town || addr.village || addr.suburb || '',
    district: addr.state_district || addr.county || '',
    state: addr.state || '',
    pinCode: addr.postcode || '',
    road: addr.road || addr.neighbourhood || ''
  };
}

export function LocationPickerModal({
  isOpen = false,
  onClose,
  initialPosition,
  onConfirm,
  title = 'Select Location on Map',
  description = 'Search an Indian city, mandi yard, or PIN code, or click/drag the pin directly on the map.',
  searchPlaceholder = 'Search city, mandi yard, district, or PIN code...',
  confirmLabel = 'Confirm Location',
  cancelLabel = 'Cancel',
  coordinatesLabel = 'Selected Coordinates',
  noResultsLabel = 'No matching places found in India.',
  searchingLabel = 'Searching places...'
}) {
  const normalizedInitial = useMemo(
    () => normalizePosition(initialPosition),
    [initialPosition]
  );

  const [prevOpen, setPrevOpen] = useState(isOpen);
  const [position, setPosition] = useState({
    lat: normalizedInitial.lat,
    lng: normalizedInitial.lng
  });
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [targetView, setTargetView] = useState({
    lat: normalizedInitial.lat,
    lng: normalizedInitial.lng,
    zoom: normalizedInitial.hasInitial ? 14 : 5
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const abortRef = useRef(null);
  const pinIcon = useMemo(() => createPinIcon(), []);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      const next = normalizePosition(initialPosition);
      setPosition({ lat: next.lat, lng: next.lng });
      setSelectedAddress(null);
      setTargetView({
        lat: next.lat,
        lng: next.lng,
        zoom: next.hasInitial ? 14 : 5
      });
      setSearchQuery('');
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&limit=6&q=${encodeURIComponent(
        trimmed
      )}`,
      {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      }
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(Array.isArray(data) ? data : []);
          setHasSearched(true);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults([]);
          setHasSearched(true);
          setIsSearching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isOpen, searchQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    const trimmed = (value || '').trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  const handleSelectResult = (item) => {
    const lat = roundCoord(item.lat);
    const lng = roundCoord(item.lon);
    const address = formatNominatimAddress(item);

    setPosition({ lat, lng });
    setSelectedAddress(address);
    setTargetView({ lat, lng, zoom: 15, ts: Date.now() });
    setResults([]);
    setHasSearched(false);
  };

  const handleMapSelect = (nextPos) => {
    setPosition(nextPos);
    setSelectedAddress(null);
  };

  const markerHandlers = useMemo(
    () => ({
      dragend(event) {
        const marker = event.target;
        const nextLatLng = marker.getLatLng();
        handleMapSelect({
          lat: roundCoord(nextLatLng.lat),
          lng: roundCoord(nextLatLng.lng)
        });
      }
    }),
    []
  );

  const handleConfirm = () => {
    onConfirm?.({
      lat: position.lat,
      lng: position.lng,
      address: selectedAddress
    });
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
      footer={
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Navigation className="w-4 h-4 text-[#0E4B2E] shrink-0" />
            <span className="font-medium">{coordinatesLabel}:</span>
            <span className="font-mono font-semibold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button variant="primary" leftIcon={MapPin} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="relative z-[1001]">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            debounceMs={350}
            shortcutHint=""
          />

          {(isSearching || results.length > 0 || (hasSearched && searchQuery.trim().length >= 2)) && (
            <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl max-h-52 overflow-y-auto divide-y divide-gray-100">
              {isSearching ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 text-xs text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E4B2E]" />
                  <span>{searchingLabel}</span>
                </div>
              ) : results.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-gray-500">
                  {noResultsLabel}
                </div>
              ) : (
                results.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-[#ECFDF5] transition-colors flex items-start gap-2.5 text-xs"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#0E4B2E] mt-0.5 shrink-0" />
                    <span className="text-gray-800 line-clamp-2">
                      {item.display_name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="h-[360px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
          {isOpen && (
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={targetView.zoom || 5}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewController targetView={targetView} />
              <MapInteractionHandler onSelectPosition={handleMapSelect} />
              <Marker
                position={[position.lat, position.lng]}
                draggable
                icon={pinIcon}
                eventHandlers={markerHandlers}
              />
            </MapContainer>
          )}
        </div>

        {selectedAddress?.displayName && (
          <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate">
            {selectedAddress.displayName}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default LocationPickerModal;
