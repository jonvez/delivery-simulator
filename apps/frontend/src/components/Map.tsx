import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
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
}

/**
 * Reusable Map component using Leaflet and OpenStreetMap
 * Story 4.1: Integrate Leaflet Map Component
 *
 * Centered on Brooklyn, NY by default with interactive controls
 */
export function Map({
  markers = [],
  center = [40.6782, -73.9442], // Brooklyn, NY coordinates
  zoom = 12,
  className = ''
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
      </MapContainer>
    </Card>
  );
}
