import React from "react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import "react-toastify/dist/ReactToastify.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// FIX: Marker icon không hiện trên react-leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;

// Default marker (blue)
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Custom red marker
const redMarkerIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fallback: Nếu không load được red marker, tạo từ CSS
const createRedMarkerSVG = () => {
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 6.9 12.5 28.5 12.5 28.5s12.5-21.6 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#dc3545"/>
      <circle cx="12.5" cy="12.5" r="7" fill="white"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#dc3545"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svgIcon)}`;
};

const redMarkerIconSVG = new L.Icon({
  iconUrl: createRedMarkerSVG(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Export red marker để sử dụng trong components khác
window.redMarkerIcon = redMarkerIcon;
window.redMarkerIconSVG = redMarkerIconSVG;

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Layout />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
