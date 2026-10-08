import { useEffect, useState } from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  Shield,
  MapPin,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Siren,
  Activity,
} from "lucide-react";

import { database } from "../firebase/firebase";


/*
  Calculate distance between two GPS coordinates
  using the Haversine formula.

  Result is returned in meters.
*/
function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371000;

  const toRadians = (value) =>
    (value * Math.PI) / 180;

  const dLat =
    toRadians(lat2 - lat1);

  const dLon =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}


function TravelerDashboard() {

  const [location, setLocation] =
    useState(null);

  const [riskLocations, setRiskLocations] =
    useState({});

  const [nearbyRisk, setNearbyRisk] =
    useState(null);


  /*
    Get T001 live location
  */

  useEffect(() => {

    const locationRef =
      ref(
        database,
        "SafeTours/liveLocations/T001"
      );

    return onValue(
      locationRef,
      (snapshot) => {

        setLocation(
          snapshot.val()
        );

      }
    );

  }, []);


  /*
    Get known risk locations
  */

  useEffect(() => {

    const riskRef =
      ref(
        database,
        "SafeTours/riskLocations"
      );

    return onValue(
      riskRef,
      (snapshot) => {

        setRiskLocations(
          snapshot.val() || {}
        );

      }
    );

  }, []);


  /*
    Check distance between traveler
    and every known risk location.
  */

  useEffect(() => {

    if (
      !location?.latitude ||
      !location?.longitude
    ) {
      setNearbyRisk(null);
      return;
    }


    const travelerLatitude =
      Number(location.latitude);

    const travelerLongitude =
      Number(location.longitude);


    let closestRisk = null;


    Object.entries(riskLocations)
      .forEach(([id, risk]) => {

        const riskLatitude =
          Number(risk.latitude);

        const riskLongitude =
          Number(risk.longitude);


        if (
          Number.isNaN(riskLatitude) ||
          Number.isNaN(riskLongitude)
        ) {
          return;
        }


        const distance =
          calculateDistance(
            travelerLatitude,
            travelerLongitude,
            riskLatitude,
            riskLongitude
          );


        /*
          Use the risk location's radius
          if available.

          Otherwise use a reasonable
          demonstration radius.
        */

        const riskRadius =
          Number(risk.radius) ||
          100;


        if (
          distance <= riskRadius
        ) {

          if (
            !closestRisk ||
            distance <
              closestRisk.distance
          ) {

            closestRisk = {
              id,
              ...risk,
              distance,
            };

          }

        }

      });


    setNearbyRisk(
      closestRisk
    );

  }, [
    location,
    riskLocations,
  ]);


  /*
    Determine overall safety status
  */

  const isRisky =
    nearbyRisk !== null;


  return (

    <div className="traveler-page">


      {/* HEADER */}

      <div className="traveler-header">

        <div className="traveler-brand">

          <div className="traveler-logo">

            <Shield size={21} />

          </div>

          <div>

            <h2>
              SafeTours
            </h2>

            <span>
              TRAVELER
            </span>

          </div>

        </div>


        <div className="traveler-online">

          <span></span>

          Monitoring Active

          <Bell size={17} />

        </div>

      </div>


      {/* GREETING */}

      <div className="traveler-greeting">

        <h1>
          Hello, Traveler 👋
        </h1>

        <p>
          Your journey is being monitored
          for your safety.
        </p>

      </div>


      {/* SAFETY STATUS */}

      <div
        className={
          isRisky
            ? "traveler-status danger"
            : "traveler-status safe"
        }
      >

        <div className="traveler-status-icon">

          {isRisky ? (
            <ShieldAlert size={30} />
          ) : (
            <ShieldCheck size={30} />
          )}

        </div>


        <div className="traveler-status-text">

          <span>
            CURRENT SAFETY STATUS
          </span>

          <h2>

            {isRisky
              ? "DANGER"
              : "SAFE"}

          </h2>

          <p>

            {isRisky
              ? "You are near a known risk location."
              : "You are currently away from known risk locations."}

          </p>

        </div>

      </div>


      {/* RISK WARNING */}

      {isRisky && (

        <div className="traveler-warning">

          <div className="warning-icon">

            <AlertTriangle size={22} />

          </div>


          <div>

            <strong>
              ⚠️ Risk Area Nearby
            </strong>

            <p>

              You are approximately{" "}

              <b>
                {Math.round(
                  nearbyRisk.distance
                )} m
              </b>{" "}

              from a known{" "}

              <b>
                {nearbyRisk.riskLevel ||
                  "HIGH"} risk
              </b>{" "}

              location.

            </p>

            <small>

              Risk score:{" "}
              {nearbyRisk.riskScore ??
                "--"}
              /100

            </small>

          </div>

        </div>

      )}


      {/* CURRENT LOCATION */}

      <div className="traveler-section">

        <div className="traveler-section-title">

          <MapPin size={18} />

          <div>

            <h3>
              Current Location
            </h3>

            <span>
              Live GPS position
            </span>

          </div>

        </div>


        <div className="traveler-location-grid">

          <div className="traveler-location-card">

            <span>
              Latitude
            </span>

            <strong>

              {location?.latitude ??
                "--"}

            </strong>

          </div>


          <div className="traveler-location-card">

            <span>
              Longitude
            </span>

            <strong>

              {location?.longitude ??
                "--"}

            </strong>

          </div>


          <div className="traveler-location-card">

            <span>
              Device
            </span>

            <strong>
              DEVICE001
            </strong>

          </div>


          <div className="traveler-location-card">

            <span>
              Monitoring
            </span>

            <strong className="active-text">

              <Activity size={13} />

              Active

            </strong>

          </div>

        </div>

      </div>


      {/* NEARBY RISK INFORMATION */}

      <div className="traveler-section">

        <div className="traveler-section-title">

          <Navigation size={18} />

          <div>

            <h3>
              Safety Information
            </h3>

            <span>
              Nearby location analysis
            </span>

          </div>

        </div>


        {nearbyRisk ? (

          <div className="nearby-risk-card">

            <div className="nearby-risk-icon">

              <AlertTriangle size={22} />

            </div>


            <div className="nearby-risk-details">

              <strong>
                {nearbyRisk.id}
              </strong>

              <span>

                {nearbyRisk.riskLevel
                  ?.toUpperCase() ||
                  "HIGH"} RISK AREA

              </span>

              <small>

                Distance:{" "}
                {Math.round(
                  nearbyRisk.distance
                )} meters

              </small>

            </div>


            <div className="nearby-risk-score">

              <span>
                Risk Score
              </span>

              <strong>
                {nearbyRisk.riskScore ??
                  "--"}
              </strong>

              <small>
                /100
              </small>

            </div>

          </div>

        ) : (

          <div className="safe-area-card">

            <ShieldCheck size={22} />

            <div>

              <strong>
                No nearby risk locations
              </strong>

              <span>
                No known unsafe areas detected
                near your current location.
              </span>

            </div>

          </div>

        )}

      </div>


      {/* SOS */}

      <div className="sos-section">

        <div>

          <h3>
            Emergency Assistance
          </h3>

          <p>
            If you are in immediate danger,
            send an emergency alert.
          </p>

        </div>


        <button className="sos-button">

          <Siren size={20} />

          SOS

        </button>

      </div>


      {/* FOOTER */}

      <div className="traveler-footer">

        <Shield size={15} />

        SafeTours Safety Monitoring System

      </div>

    </div>

  );

}


export default TravelerDashboard;