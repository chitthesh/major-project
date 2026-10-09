import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import LiveMap from "./components/LiveMap";

import {

  LayoutDashboard,

  Map,

  Users,

  Bell,

  ShieldAlert,

  History,

  Settings,

  Search,

  Wifi,

  MapPin,

  AlertTriangle,

  ShieldCheck,

  Navigation,

} from "lucide-react";

import RiskLocations from "./pages/RiskLocations";

import TravelerDashboard from "./pages/TravelerDashboard";

import {

  saveTourist,

  saveLiveLocation,

  saveLocationHistory,

  saveAlert,

} from "./services/firebaseService";

import Tourists from "./pages/Tourists";

import { database } from "./firebase/firebase";

import LiveTracking from "./pages/LiveTracking";

function App() {

  const [latitude, setLatitude] = useState(null);

  const [longitude, setLongitude] = useState(null);

  const [initialLatitude, setInitialLatitude] =

    useState(null);

  const [initialLongitude, setInitialLongitude] =

    useState(null);

  const [flag, setFlag] = useState(0);

  const [maxDistance, setMaxDistance] =

    useState(null);

  const [currentPage, setCurrentPage] =

    useState("overview");

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const hasValidCoordinates =
    latitude !== null && latitude !== undefined &&
    longitude !== null && longitude !== undefined &&
    initialLatitude !== null && initialLatitude !== undefined &&
    initialLongitude !== null && initialLongitude !== undefined &&
    [latitude, longitude, initialLatitude, initialLongitude].every(
      (value) => Number.isFinite(Number(value))
    );

  const distanceFromStart = hasValidCoordinates
    ? (() => {
        const earthRadius = 6371000;
        const lat1 = toRadians(Number(initialLatitude));
        const lat2 = toRadians(Number(latitude));
        const deltaLat = toRadians(Number(latitude) - Number(initialLatitude));
        const deltaLon = toRadians(Number(longitude) - Number(initialLongitude));
        const a = Math.sin(deltaLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      })()
    : null;

  const hasValidGeofence = maxDistance !== null && maxDistance !== undefined &&
    Number.isFinite(Number(maxDistance)) && Number(maxDistance) > 0;
  const locationUnknown = !hasValidCoordinates || !hasValidGeofence;
  const isDanger = !locationUnknown && distanceFromStart > Number(maxDistance);

  /*

  =====================================================

  SYNC TOURIST DATA WITH FIREBASE

  =====================================================

  */

  useEffect(() => {

    if (

      latitude === null ||

      longitude === null

    ) {

      return;

    }

    const syncLocation = async () => {

      try {

        const status = locationUnknown ? "unknown" : isDanger ? "danger" : "safe";

        /*

        Save tourist

        */

        await saveTourist(

          "T001",

          {

            name: "Tourist T001",

            deviceId: "DEVICE001",

            status,

          }

        );

        /*

        Save current live location

        */

        await saveLiveLocation(

          "T001",

          {

            latitude:

              Number(latitude),

            longitude:

              Number(longitude),

            status,

          }

        );

        /*

        Save location history

        */

        await saveLocationHistory(

          "T001",

          {

            latitude:

              Number(latitude),

            longitude:

              Number(longitude),

            status,

            timestamp:

              Date.now(),

          }

        );

        /*

        Save alert when danger

        */

        if (isDanger) {

          await saveAlert(

            "alert-" + Date.now(),

            {

              touristId: "T001",

              type: "geofence",

              severity: "danger",

              message:

                "Tourist T001 is outside the configured safe-zone radius",

              latitude:

                Number(latitude),

              longitude:

                Number(longitude),

              timestamp:

                Date.now(),

              status: "active",

            }

          );

        }

      } catch (error) {

        console.error(

          "Failed to sync tourist:",

          error

        );

      }

    };

    syncLocation();

  }, [latitude, longitude, initialLatitude, initialLongitude, maxDistance, isDanger, locationUnknown]);

  /*

  =====================================================

  LIVE LATITUDE

  =====================================================

  */

  useEffect(() => {

    const latitudeRef =

      ref(

        database,

        "Safetours1/Cordinate1"

      );

    return onValue(

      latitudeRef,

      (snapshot) => {

        setLatitude(

          snapshot.val()

        );

      }

    );

  }, []);

  /*

  =====================================================

  LIVE LONGITUDE

  =====================================================

  */

  useEffect(() => {

    const longitudeRef =

      ref(

        database,

        "Safetours1/Cordinate2"

      );

    return onValue(

      longitudeRef,

      (snapshot) => {

        setLongitude(

          snapshot.val()

        );

      }

    );

  }, []);

  /*

  =====================================================

  INITIAL LATITUDE

  =====================================================

  */

  useEffect(() => {

    const initialLatitudeRef =

      ref(

        database,

        "Safetours2/initialCordinate1"

      );

    return onValue(

      initialLatitudeRef,

      (snapshot) => {

        setInitialLatitude(

          snapshot.val()

        );

      }

    );

  }, []);

  /*

  =====================================================

  INITIAL LONGITUDE

  =====================================================

  */

  useEffect(() => {

    const initialLongitudeRef =

      ref(

        database,

        "Safetours2/initialCordinate2"

      );

    return onValue(

      initialLongitudeRef,

      (snapshot) => {

        setInitialLongitude(

          snapshot.val()

        );

      }

    );

  }, []);

  /*

  =====================================================

  SAFETY FLAG

  =====================================================

  */

  useEffect(() => {

    const flagRef =

      ref(

        database,

        "Safetours4/flag"

      );

    return onValue(

      flagRef,

      (snapshot) => {

        setFlag(

          snapshot.val() ?? 0

        );

      }

    );

  }, []);

  /*

  =====================================================

  GEOFENCE DISTANCE

  =====================================================

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

  /* Danger status is calculated from the configured geofence above. */

  /*

  =====================================================

  TRAVELER VIEW

  =====================================================

  */

  const isTraveler =

    currentPage === "traveler";

  return (

    <div className="app">

      {/* =================================================

          SIDEBAR

      ================================================= */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-icon">

            <ShieldCheck size={24} />

          </div>

          <div>

            <h1>

              SafeTours

            </h1>

            <span>

              {isTraveler

                ? "TRAVELER"

                : "CONTROL ROOM"}

            </span>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="navigation">

          {/* MONITORING */}

          {!isTraveler && (

            <p className="nav-title">

              MONITORING

            </p>

          )}

          {!isTraveler && (

            <>

              {/* OVERVIEW */}

              <button

                className={

                  currentPage === "overview"

                    ? "nav-item active"

                    : "nav-item"

                }

                onClick={() =>

                  setCurrentPage(

                    "overview"

                  )

                }

              >

                <LayoutDashboard

                  size={19}

                />

                Overview

              </button>

              {/* LIVE TRACKING */}

              <button

                className={

                  currentPage === "tracking"

                    ? "nav-item active"

                    : "nav-item"

                }

                onClick={() =>

                  setCurrentPage(

                    "tracking"

                  )

                }

              >

                <Map size={19} />

                Live Tracking

              </button>

              {/* TOURISTS */}

              <button

                className={

                  currentPage === "tourists"

                    ? "nav-item active"

                    : "nav-item"

                }

                onClick={() =>

                  setCurrentPage(

                    "tourists"

                  )

                }

              >

                <Users size={19} />

                Tourists

              </button>

              {/* SAFETY */}

              <p className="nav-title">

                SAFETY

              </p>

              {/* ALERTS */}

              <button className="nav-item">

                <Bell size={19} />

                Alerts

                {isDanger && (

                  <span className="alert-count">

                    1

                  </span>

                )}

              </button>

              {/* RISK LOCATIONS */}

              <button

                className={

                  currentPage === "risk"

                    ? "nav-item active"

                    : "nav-item"

                }

                onClick={() =>

                  setCurrentPage(

                    "risk"

                  )

                }

              >

                <ShieldAlert

                  size={19}

                />

                Risk Locations

              </button>

            </>

          )}

          {/* TRAVELER NAVIGATION */}

          {isTraveler && (

            <>

              <p className="nav-title">

                TRAVELER

              </p>

              <button

                className="nav-item active"

              >

                <ShieldCheck

                  size={19}

                />

                Safety Dashboard

              </button>

              <button

                className="nav-item"

                onClick={() =>

                  setCurrentPage(

                    "overview"

                  )

                }

              >

                <LayoutDashboard

                  size={19}

                />

                Control Room

              </button>

            </>

          )}

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <button className="nav-item">

            <Settings size={19} />

            Settings

          </button>

          <div className="system-status">

            <span className="status-dot"></span>

            <div>

              <strong>

                System Online

              </strong>

              <small>

                Firebase connected

              </small>

            </div>

          </div>

        </div>

      </aside>

      {/* =================================================

          MAIN CONTENT

      ================================================= */}

      <main className="main">

        {/* =================================================

            TOP BAR

        ================================================= */}

        <header className="topbar">

          <div>

            <h2>

              {isTraveler

                ? "Traveler Dashboard"

                : "Control Room"}

            </h2>

            <p>

              {isTraveler

                ? "Personal real-time safety monitoring"

                : "Real-time tourist safety monitoring"}

            </p>

          </div>

          <div className="top-actions">

            {/* SEARCH ONLY CONTROL ROOM */}

            {!isTraveler && (

              <div className="search">

                <Search size={18} />

                <input

                  type="text"

                  placeholder="Search tourist..."

                />

              </div>

            )}

            {/* TRAVELER / CONTROL ROOM SWITCH */}

            <button

              className="traveler-view-button"

              onClick={() =>

                setCurrentPage(

                  isTraveler

                    ? "overview"

                    : "traveler"

                )

              }

            >

              {isTraveler

                ? "Control Room"

                : "Traveler View"}

            </button>

            {/* CONNECTION */}

            <div className="connection">

              <Wifi size={17} />

              Live

            </div>

            {/* ADMIN */}

            <div className="admin">

              <div className="admin-avatar">

                {isTraveler

                  ? "T1"

                  : "CR"}

              </div>

              <div>

                <strong>

                  {isTraveler

                    ? "Tourist T001"

                    : "Control Room"}

                </strong>

                <span>

                  {isTraveler

                    ? "Traveler"

                    : "Administrator"}

                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================

            CONTROL ROOM — OVERVIEW

        ================================================= */}

        {currentPage === "overview" && (

          <section className="dashboard">

            {/* STAT CARDS */}

            <div className="stat-card">

              <div className="stat-icon blue">

                <Users size={22} />

              </div>

              <div>

                <span>

                  Total Tourists

                </span>

                <strong>

                  1

                </strong>

                <small>

                  Currently monitored

                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon green">

                <ShieldCheck size={22} />

              </div>

              <div>

                <span>

                  Safe

                </span>

                <strong>

                  {isDanger ? 0 : 1}

                </strong>

                <small>

                  Within safe zone

                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon orange">

                <AlertTriangle

                  size={22}

                />

              </div>

              <div>

                <span>

                  Warning

                </span>

                <strong>

                  0

                </strong>

                <small>

                  Needs attention

                </small>

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon red">

                <ShieldAlert

                  size={22}

                />

              </div>

              <div>

                <span>

                  Danger

                </span>

                <strong>

                  {isDanger ? 1 : 0}

                </strong>

                <small>

                  Immediate attention

                </small>

              </div>

            </div>

            {/* MAP */}

            <div className="panel map-panel">

              <div className="panel-header">

                <div>

                  <h3>

                    Live Tourist Tracking

                  </h3>

                  <p>

                    Real-time location monitoring

                  </p>

                </div>

                <div className="live-badge">

                  <span></span>

                  LIVE

                </div>

              </div>

              <LiveMap

                latitude={

                  latitude

                }

                longitude={

                  longitude

                }

                initialLatitude={

                  initialLatitude

                }

                initialLongitude={

                  initialLongitude

                }

                maxDistance={

                  maxDistance

                }

                isDanger={

                  isDanger

                }

              />

            </div>

            {/* TOURIST PANEL */}

            <div className="panel tourist-panel">

              <div className="panel-header">

                <div>

                  <h3>

                    Tourist Status

                  </h3>

                  <p>

                    Currently monitored

                  </p>

                </div>

              </div>

              <div className="tourist-card">

                <div className="tourist-avatar">

                  T1

                </div>

                <div className="tourist-info">

                  <strong>

                    Tourist T001

                  </strong>

                  <span>

                    <Navigation

                      size={13}

                    />

                    Live location

                  </span>

                </div>

                <div

                  className={

                    isDanger

                      ? "status danger"

                      : "status safe"

                  }

                >

                  {isDanger

                    ? "DANGER"

                    : "SAFE"}

                </div>

              </div>

              <div className="location-details">

                <div>

                  <span>

                    Latitude

                  </span>

                  <strong>

                    {latitude ?? "--"}

                  </strong>

                </div>

                <div>

                  <span>

                    Longitude

                  </span>

                  <strong>

                    {longitude ?? "--"}

                  </strong>

                </div>

                <div>

                  <span>

                    Geofence

                  </span>

                  <strong>

                    {maxDistance

                      ? `${maxDistance} m`

                      : "--"}

                  </strong>

                </div>

              </div>

            </div>

            {/* ALERTS */}

            <div className="panel alerts-panel">

              <div className="panel-header">

                <div>

                  <h3>

                    Active Alerts

                  </h3>

                  <p>

                    Latest safety events

                  </p>

                </div>

                <button

                  className="view-all"

                >

                  View all

                </button>

              </div>

              {isDanger ? (

                <div className="alert-item danger-alert">

                  <div className="alert-icon">

                    <AlertTriangle

                      size={20}

                    />

                  </div>

                  <div>

                    <strong>

                      Tourist T001 crossed

                      safe boundary

                    </strong>

                    <span>

                      Immediate attention

                      required

                    </span>

                  </div>

                  <small>

                    LIVE

                  </small>

                </div>

              ) : (

                <div className="empty-alert">

                  <ShieldCheck

                    size={25}

                  />

                  <div>

                    <strong>

                      No active alerts

                    </strong>

                    <span>

                      {locationUnknown
                        ? "Waiting for valid location and safe-zone settings"
                        : "Tourist is within the configured boundary"}

                    </span>

                  </div>

                </div>

              )}

            </div>

          </section>

        )}

        {/* =================================================

            TOURISTS

        ================================================= */}

        {currentPage === "tourists" && (

          <Tourists />

        )}

        {/* =================================================

            LIVE TRACKING

        ================================================= */}

        {currentPage === "tracking" && (

          <LiveTracking />

        )}

        {/* =================================================

            RISK LOCATIONS

        ================================================= */}

        {currentPage === "risk" && (

          <RiskLocations />

        )}

        {/* =================================================

            TRAVELER DASHBOARD

        ================================================= */}

        {currentPage === "traveler" && (

          <TravelerDashboard />

        )}

      </main>

    </div>

  );

}

export default App;