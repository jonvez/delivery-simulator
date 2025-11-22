import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from './ui/card';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
  position: LatLngExpression;
  label: string;
}

interface MapProps {
  markers?: MapMarker[];
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  fitBounds?: boolean; // Story 4.3: Auto-fit map to show all markers
}

/**
 * Component to fit map bounds to markers
 * Story 4.3: Auto-fit functionality
 */
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = new LatLngBounds(markers.map(m => m.position as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

/**
 * Reusable Map component using Leaflet and OpenStreetMap
 * Story 4.1: Integrate Leaflet Map Component
 * Story 4.3: Enhanced with auto-fit bounds
 *
 * Centered on Brooklyn, NY by default with interactive controls
 */
export function Map({
  markers = [],
  center = [40.6782, -73.9442], // Brooklyn, NY coordinates
  zoom = 12,
  className = '',
  fitBounds = false
}: MapProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '500px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}

        {fitBounds && <FitBounds markers={markers} />}
      </MapContainer>
    </Card>
  );
}
