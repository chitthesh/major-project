import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";

import { useEffect, useState } from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import { database } from "../firebase/firebase";

import L from "leaflet";

import "leaflet/dist/leaflet.css";


// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// --------------------------------------------------
// Keep map centered on tourist
// --------------------------------------------------

function MapCenter({
  latitude,
  longitude,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null
    ) {
      map.setView(
        [
          Number(latitude),
          Number(longitude),
        ],
        map.getZoom()
      );
    }
  }, [latitude, longitude, map]);

  return null;
}


// --------------------------------------------------
// LIVE MAP
// --------------------------------------------------

function LiveMap({
  latitude,
  longitude,
  initialLatitude,
  initialLongitude,
  maxDistance,
  isDanger,
}) {

  // ------------------------------------------------
  // Risk locations from Firebase
  // ------------------------------------------------

  const [riskLocations, setRiskLocations] =
    useState({});


  useEffect(() => {

    const riskRef = ref(
      database,
      "SafeTours/riskLocations"
    );

    const unsubscribe = onValue(
      riskRef,
      (snapshot) => {

        setRiskLocations(
          snapshot.val() || {}
        );

      }
    );

    return unsubscribe;

  }, []);


  // ------------------------------------------------
  // Convert Firebase object into array
  // ------------------------------------------------

  const riskList =
    Object.entries(riskLocations).map(
      ([id, data]) => ({
        id,
        ...data,
      })
    );


  // ------------------------------------------------
  // Wait for tourist location
  // ------------------------------------------------

  if (
    latitude === null ||
    longitude === null
  ) {

    return (
      <div className="map-loading">

        <div className="map-loading-icon">
          📍
        </div>

        <strong>
          Waiting for location...
        </strong>

        <span>
          Waiting for live GPS coordinates
        </span>

      </div>
    );
  }


  // ------------------------------------------------
  // Current tourist position
  // ------------------------------------------------

  const touristPosition = [
    Number(latitude),
    Number(longitude),
  ];


  // ------------------------------------------------
  // Initial / safe-zone location
  // ------------------------------------------------

  const hasInitialLocation =
    initialLatitude !== null &&
    initialLongitude !== null;


  const safeZonePosition =
    hasInitialLocation
      ? [
          Number(initialLatitude),
          Number(initialLongitude),
        ]
      : touristPosition;


  // ------------------------------------------------
  // Safe-zone radius
  // ------------------------------------------------

  const radius =
    Number(maxDistance) || 0;


  // ------------------------------------------------
  // MAP
  // ------------------------------------------------

  return (

    <MapContainer
      center={touristPosition}
      zoom={17}
      scrollWheelZoom={true}
      className="live-map"
    >

      {/* ------------------------------------------
          OpenStreetMap
      ------------------------------------------ */}

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


      {/* ------------------------------------------
          Keep map centered on tourist
      ------------------------------------------ */}

      <MapCenter
        latitude={latitude}
        longitude={longitude}
      />


      {/* ------------------------------------------
          PERSONAL SAFE ZONE
      ------------------------------------------ */}

      {radius > 0 &&
        hasInitialLocation && (

          <Circle
            center={safeZonePosition}
            radius={radius}
            pathOptions={{
              color: isDanger
                ? "#ef4444"
                : "#16a34a",

              fillColor: isDanger
                ? "#ef4444"
                : "#16a34a",

              fillOpacity: 0.12,

              weight: 2,
            }}
          />

        )}


      {/* ------------------------------------------
          INITIAL / SAFE LOCATION
      ------------------------------------------ */}

      {hasInitialLocation && (

        <Marker
          position={safeZonePosition}
        >

          <Popup>

            <div className="map-popup">

              <strong>
                Safe Zone Center
              </strong>

              <span>
                Initial Tourist Location
              </span>

              <small>
                Latitude:{" "}
                {Number(
                  initialLatitude
                ).toFixed(6)}
              </small>

              <small>
                Longitude:{" "}
                {Number(
                  initialLongitude
                ).toFixed(6)}
              </small>

              <small>
                Radius: {radius} m
              </small>

            </div>

          </Popup>

        </Marker>

      )}


      {/* ------------------------------------------
          KNOWN RISK LOCATIONS
      ------------------------------------------ */}

      {riskList.map((risk) => {

        const riskLatitude =
          Number(risk.latitude);

        const riskLongitude =
          Number(risk.longitude);


        // Ignore invalid Firebase records

        if (
          Number.isNaN(riskLatitude) ||
          Number.isNaN(riskLongitude)
        ) {
          return null;
        }


        // Risk level

        const level =
          risk.riskLevel
            ?.toLowerCase();


        // Risk color

        const riskColor =
          level === "high"
            ? "#dc2626"
            : level === "medium"
            ? "#ea580c"
            : "#16a34a";


        // Risk visualization radius

        const riskRadius =
          Number(risk.radius) ||
          (
            level === "high"
              ? 100
              : level === "medium"
              ? 75
              : 50
          );


        return (

          <>

            {/* ----------------------------------
                RISK AREA CIRCLE
            ---------------------------------- */}

            <Circle
              center={[
                riskLatitude,
                riskLongitude,
              ]}
              radius={riskRadius}
              pathOptions={{
                color: riskColor,

                fillColor: riskColor,

                fillOpacity: 0.16,

                weight: 2,
              }}
            />


            {/* ----------------------------------
                RISK LOCATION MARKER
            ---------------------------------- */}

            <Marker
              position={[
                riskLatitude,
                riskLongitude,
              ]}
            >

              <Popup>

                <div className="map-popup">

                  <strong>
                    ⚠️ Risk Location
                  </strong>


                  <span
                    style={{
                      color: riskColor,
                      fontWeight: "700",
                    }}
                  >

                    {risk.riskLevel
                      ?.toUpperCase() ||
                      "UNKNOWN"}

                    {" "}RISK

                  </span>


                  <small>
                    Latitude:{" "}
                    {riskLatitude.toFixed(6)}
                  </small>


                  <small>
                    Longitude:{" "}
                    {riskLongitude.toFixed(6)}
                  </small>


                  <small>
                    Risk Score:{" "}
                    {risk.riskScore ??
                      "--"}

                    /100
                  </small>


                  <small>
                    Incidents:{" "}
                    {risk.incidents ??
                      0}
                  </small>


                  {risk.reason && (

                    <small>
                      {risk.reason}
                    </small>

                  )}

                </div>

              </Popup>

            </Marker>

          </>

        );

      })}


      {/* ------------------------------------------
          CURRENT TOURIST
      ------------------------------------------ */}

      <Marker
        position={touristPosition}
      >

        <Popup>

          <div className="map-popup">

            <strong>
              Tourist T001
            </strong>


            <span>

              {isDanger
                ? "🔴 Outside safe zone"
                : "🟢 Inside safe zone"}

            </span>


            <small>
              Latitude:{" "}
              {Number(
                latitude
              ).toFixed(6)}
            </small>


            <small>
              Longitude:{" "}
              {Number(
                longitude
              ).toFixed(6)}
            </small>

          </div>

        </Popup>

      </Marker>

    </MapContainer>

  );
}


export default LiveMap;