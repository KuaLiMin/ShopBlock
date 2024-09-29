import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const MyMapComponent = ({ latitude, longitude }) => {
    const center = {
        lat: latitude,
        lng: longitude,
    };

    return (
        <MapContainer style={mapContainerStyle} center={center} zoom={12} scrollWheelZoom={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={center}>
                <Popup>
                    Location: {latitude}, {longitude}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MyMapComponent;
