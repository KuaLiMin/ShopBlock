import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
});

const mapContainerStyle = {
    height: '400px',
    width: '800px',
};

const MyMapComponent = ({locations}) => {
    const center = locations.length > 0
        ? { lat: locations[0].latitude, lng: locations[0].longitude }
        : { lat: 0, lng: 0 }; // Default center if no locations

    const singaporeCoordinates = [1.3521, 103.8198]; // Latitude and Longitude of Singapore
    const zoomLevel = 11; // Adjust the zoom level to show the whole of Singapore
    

    return (
        <MapContainer style={mapContainerStyle} center = {singaporeCoordinates} zoom={zoomLevel} scrollWheelZoom={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((location, index) => (
                <Marker
                    key={index}
                    position={{ lat: location.latitude, lng: location.longitude }}
                >
                    <Tooltip>
                        Location: {location.query}<br />
                    </Tooltip>
                    <Popup>
                        {location.notes && location.notes.trim() !== "" ? (
                            <span>Notes: {location.notes}</span>
                        ) : (
                            <span>No instructions given</span>
                        )}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MyMapComponent;
