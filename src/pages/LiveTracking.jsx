import { useEffect, useState } from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  Radio,
  Navigation,
  Clock,
  ShieldCheck,
  ShieldAlert,
  MapPin,
} from "lucide-react";

import { database } from "../firebase/firebase";

import LiveMap from "../components/LiveMap";


function LiveTracking() {

  const [tourist, setTourist] = useState(null);

  const [location, setLocation] =
    useState(null);

  const [initialLocation, setInitialLocation] =
    useState(null);

  const [maxDistance, setMaxDistance] =
    useState(null);


  /*
    Tourist information
  */

  useEffect(() => {

    const touristRef =
      ref(
        database,
        "SafeTours/tourists/T001"
      );

    return onValue(
      touristRef,
      (snapshot) => {

        setTourist(
          snapshot.val()
        );

      }
    );

  }, []);


  /*
    Live location
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
    Initial safe-zone location
  */

  useEffect(() => {

    const latRef =
      ref(
        database,
        "Safetours2/initialCordinate1"
      );

    const lngRef =
      ref(
        database,
        "Safetours2/initialCordinate2"
      );


    let latitude = null;
    let longitude = null;


    const unsubscribeLat =
      onValue(
        latRef,
        (snapshot) => {

          latitude =
            snapshot.val();

          setInitialLocation(
            (previous) => ({
              latitude,
              longitude:
                previous?.longitude ??
                longitude,
            })
          );

        }
      );


    const unsubscribeLng =
      onValue(
        lngRef,
        (snapshot) => {

          longitude =
            snapshot.val();

          setInitialLocation(
            (previous) => ({
              latitude:
                previous?.latitude ??
                latitude,

              longitude,
            })
          );

        }
      );


    return () => {

      unsubscribeLat();
      unsubscribeLng();

    };

  }, []);


  /*
    Geofence radius
  */

  useEffect(() => {

    const distanceRef =
      ref(
        database,
        "Safetours3/maxDistance"
      );

    return onValue(
      distanceRef,
      (snapshot) => {

        setMaxDistance(
          snapshot.val()
        );

      }
    );

  }, []);


  const isDanger =
    tourist?.status === "danger";


  return (

    <div className="tracking-page">


      {/* HEADER */}

      <div className="tracking-header">

        <div>

          <div className="tracking-title">

            <Radio size={20} />

            <h2>
              Live Tracking
            </h2>

          </div>

          <p>
            Monitor tourist locations in real time
          </p>

        </div>


        <div className="tracking-live">

          <span></span>

          LIVE MONITORING

        </div>

      </div>


      {/* MAIN GRID */}

      <div className="tracking-grid">


        {/* MAP */}

        <div className="tracking-map-panel">

          <div className="tracking-panel-header">

            <div>

              <h3>
                Tourist Location
              </h3>

              <p>
                Real-time GPS position
              </p>

            </div>

            <div className="map-status">

              <span></span>

              Connected

            </div>

          </div>


          <div className="tracking-map">

            <LiveMap
              latitude={
                location?.latitude ??
                null
              }

              longitude={
                location?.longitude ??
                null
              }

              initialLatitude={
                initialLocation?.latitude ??
                null
              }

              initialLongitude={
                initialLocation?.longitude ??
                null
              }

              maxDistance={
                maxDistance
              }

              isDanger={
                isDanger
              }

            />

          </div>

        </div>


        {/* TOURIST DETAILS */}

        <div className="tracking-details">


          <div className="detail-header">

            <div className="detail-avatar">

              T1

            </div>

            <div>

              <h3>
                {tourist?.name ??
                  "Tourist T001"}
              </h3>

              <span>
                {tourist?.deviceId ??
                  "DEVICE001"}
              </span>

            </div>

          </div>


          {/* STATUS */}

          <div
            className={
              isDanger
                ? "tracking-status danger"
                : "tracking-status safe"
            }
          >

            {isDanger ? (
              <ShieldAlert size={22} />
            ) : (
              <ShieldCheck size={22} />
            )}


            <div>

              <strong>

                {isDanger
                  ? "DANGER"
                  : "SAFE"}

              </strong>

              <span>

                {isDanger
                  ? "Tourist is outside the safe zone"
                  : "Tourist is inside the safe zone"}

              </span>

            </div>

          </div>


          {/* LOCATION */}

          <div className="detail-section">

            <h4>
              Current Location
            </h4>


            <div className="detail-row">

              <div className="detail-icon">

                <MapPin size={16} />

              </div>

              <div>

                <span>
                  Latitude
                </span>

                <strong>

                  {location?.latitude ??
                    "--"}

                </strong>

              </div>

            </div>


            <div className="detail-row">

              <div className="detail-icon">

                <Navigation size={16} />

              </div>

              <div>

                <span>
                  Longitude
                </span>

                <strong>

                  {location?.longitude ??
                    "--"}

                </strong>

              </div>

            </div>

          </div>


          {/* SAFETY */}

          <div className="detail-section">

            <h4>
              Safety Information
            </h4>


            <div className="info-card">

              <span>
                Geofence radius
              </span>

              <strong>
                {maxDistance
                  ? `${maxDistance} m`
                  : "--"}
              </strong>

            </div>


            <div className="info-card">

              <span>
                Monitoring status
              </span>

              <strong className="green-text">

                Active

              </strong>

            </div>


            <div className="info-card">

              <span>
                Device
              </span>

              <strong>
                {tourist?.deviceId ??
                  "DEVICE001"}
              </strong>

            </div>

          </div>


          {/* LAST UPDATE */}

          <div className="last-update">

            <Clock size={15} />

            <span>
              Live data synchronized with Firebase
            </span>

          </div>


        </div>

      </div>

    </div>

  );

}


export default LiveTracking;