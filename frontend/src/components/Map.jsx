/* eslint-disable react/prop-types */
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";
import { useTheme } from "../context/ThemeContext";

import "leaflet/dist/leaflet.css";

const customIcon = new Icon({
  iconUrl: "../../location.png", // Provide the path to your custom icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = ({ latAndLong, zoom }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const mapKey = latAndLong ? `${latAndLong[0]}-${latAndLong[1]}` : "default";

  const url = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <MapContainer
      key={`${mapKey}-${isDark ? "dark" : "light"}`}
      center={latAndLong && latAndLong.length !== 0 ? latAndLong : [24, 90]}
      zoom={zoom ? zoom : 4}
      scrollWheelZoom={false}
      className="w-full rounded-lg h-full"
    >
      <TileLayer url={url} attribution={attribution} />
      <Marker
        position={latAndLong && latAndLong.length !== 0 ? latAndLong : [23, 78]}
        icon={customIcon}
      >
        <Popup>
          <div className="p-1 text-xs font-medium text-gray-900 dark:text-white">
            Property Location Coordinates
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
