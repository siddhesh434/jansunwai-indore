import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function IndoreMap() {
  // Random coordinates in Indore (approx)
  const coordinates = [
    { lat: 22.7196, lng: 75.8577 }, // Rajwada
    { lat: 22.7339, lng: 75.8499 }, // Khajrana Ganesh Temple
    { lat: 22.6945, lng: 75.8800 }, // Crystal IT Park
    { lat: 22.7525, lng: 75.8936 }, // Pipliyapala Lake
    { lat: 22.7170, lng: 75.8330 }, // Sarafa Bazaar
  ];

  // Multiple colors
  const colors = ["red", "blue", "green", "orange", "purple"];

  return (
    <MapContainer
      center={[22.7196, 75.8577]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* Base map tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Plot each coordinate */}
      {coordinates.map((coord, i) => (
        <CircleMarker
          key={i}
          center={[coord.lat, coord.lng]}
          pathOptions={{
            color: colors[i % colors.length],
            fillColor: colors[i % colors.length],
          }}
          radius={12}
        >
          <Popup>
            📍 Point {i + 1} <br /> ({coord.lat}, {coord.lng})
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
