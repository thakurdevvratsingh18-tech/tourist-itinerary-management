import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function RouteMap({ origin, destinations = [], routeColor = '#254d25', height = '400px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on Northern/Central India if empty
    const defaultCenter = [22.5, 78.9];
    const defaultZoom = 5;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(defaultCenter, defaultZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latLngs = [];

    // 1. Add Origin Marker
    if (origin && origin.lat && origin.lng) {
      const originLatLng = [origin.lat, origin.lng];
      latLngs.push(originLatLng);

      const originIcon = L.divIcon({
        className: 'custom-origin-marker',
        html: `<div style="background-color: #c1694f; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">S</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(originLatLng, { icon: originIcon })
        .addTo(map)
        .bindPopup(`<strong>Origin:</strong> ${origin.name || 'Start Location'}`);
    }

    // 2. Add Destination Markers in Order
    destinations.forEach((dest, idx) => {
      const lat = dest.coordinates?.lat || dest.lat;
      const lng = dest.coordinates?.lng || dest.lng;

      if (lat && lng) {
        const destLatLng = [lat, lng];
        latLngs.push(destLatLng);

        const numberIcon = L.divIcon({
          className: 'custom-dest-marker',
          html: `<div style="background-color: ${routeColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker(destLatLng, { icon: numberIcon })
          .addTo(map)
          .bindPopup(
            `<strong>Stop ${idx + 1}:</strong> ${dest.name}<br>${dest.state ? dest.state : ''}`
          );
      }
    });

    // 3. Connect Route with Polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 8',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 8);
    }
  }, [origin, destinations, routeColor]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className="rounded border border-gray-200 z-10 overflow-hidden shadow-xs"
    />
  );
}
