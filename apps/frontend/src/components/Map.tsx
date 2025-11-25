import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { LatLngExpression, DivIcon } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Create a numbered marker icon for route visualization
 * Story 4.4: Route Sequence Visualization
 */
function createNumberedIcon(number: number): DivIcon {
  return L.divIcon({
    className: 'numbered-marker',
    html: `<div style="
      background-color: #3b82f6;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export interface MapMarker {
  position: LatLngExpression;
  label: string;
  /** Optional sequence number for route visualization (Story 4.4) */
  sequenceNumber?: number;
}

interface MapProps {
  markers?: MapMarker[];
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  fitBounds?: boolean; // Story 4.3: Auto-fit map to show all markers
  showRoute?: boolean; // Story 4.4: Show connecting lines between markers
}

/**
 * Component to fit map bounds to markers
 * Story 4.3: Auto-fit functionality
 */
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => m.position as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

/**
 * Reusable Map component using Leaflet and OpenStreetMap
 * Story 4.1: Integrate Leaflet Map Component
 * Story 4.3: Enhanced with auto-fit bounds
 * Story 4.4: Enhanced with route sequence visualization
 *
 * Centered on Brooklyn, NY by default with interactive controls
 */
export function Map({
  markers = [],
  center = [40.6782, -73.9442], // Brooklyn, NY coordinates
  zoom = 12,
  className = '',
  fitBounds = false,
  showRoute = false
}: MapProps) {
  // Extract route path from markers for polyline
  const routePath = showRoute && markers.length > 1
    ? markers.map(m => m.position as [number, number])
    : [];

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

        {/* Polyline connecting route points - Story 4.4 */}
        {showRoute && routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10'
            }}
          />
        )}

        {/* Markers - use numbered icons if sequence numbers are provided */}
        {markers.map((marker, index) => {
          const icon = marker.sequenceNumber !== undefined
            ? createNumberedIcon(marker.sequenceNumber)
            : DefaultIcon;

          return (
            <Marker
              key={index}
              position={marker.position}
              icon={icon}
            >
              <Popup>
                {marker.sequenceNumber !== undefined && (
                  <div className="font-semibold text-blue-600">
                    Stop #{marker.sequenceNumber}
                  </div>
                )}
                {marker.label}
              </Popup>
            </Marker>
          );
        })}

        {fitBounds && <FitBounds markers={markers} />}
      </MapContainer>
    </Card>
  );
}
