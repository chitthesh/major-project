import { useEffect, useState } from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  Search,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Activity,
} from "lucide-react";

import { database } from "../firebase/firebase";


function RiskLocations() {

  const [riskLocations, setRiskLocations] =
    useState({});

  const [search, setSearch] =
    useState("");


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


  const locations =
    Object.entries(riskLocations).map(
      ([id, data]) => ({
        id,
        ...data,
      })
    );


  const filteredLocations =
    locations.filter((location) => {

      const text =
        search.toLowerCase();

      return (
        location.id
          ?.toLowerCase()
          .includes(text) ||

        String(location.latitude)
          .includes(text) ||

        String(location.longitude)
          .includes(text) ||

        location.riskLevel
          ?.toLowerCase()
          .includes(text)
      );

    });


  function getRiskClass(level) {

    if (
      level?.toLowerCase() === "high"
    ) {
      return "high";
    }

    if (
      level?.toLowerCase() === "medium"
    ) {
      return "medium";
    }

    return "low";
  }


  return (

    <div className="risk-page">

      {/* HEADER */}

      <div className="risk-header">

        <div>

          <div className="risk-title">

            <ShieldAlert size={22} />

            <div>

              <h2>
                Risk Locations
              </h2>

              <p>
                Areas identified as potentially unsafe
              </p>

            </div>

          </div>

        </div>


        <div className="risk-summary">

          <strong>
            {locations.length}
          </strong>

          <span>
            Risk Areas
          </span>

        </div>

      </div>


      {/* SEARCH */}

      <div className="risk-toolbar">

        <div className="risk-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search by location or risk level..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* LOCATION CARDS */}

      <div className="risk-list">

        {filteredLocations.length === 0 ? (

          <div className="no-risk">

            <ShieldAlert size={30} />

            <strong>
              No risk locations found
            </strong>

            <span>
              Risk locations identified by the
              safety system will appear here.
            </span>

          </div>

        ) : (

          filteredLocations.map(
            (location) => {

              const riskClass =
                getRiskClass(
                  location.riskLevel
                );


              return (

                <div
                  className="risk-card"
                  key={location.id}
                >

                  {/* ICON */}

                  <div
                    className={`risk-location-icon ${riskClass}`}
                  >

                    <MapPin size={21} />

                  </div>


                  {/* LOCATION */}

                  <div className="risk-location-info">

                    <div className="risk-card-title">

                      <strong>
                        {location.id}
                      </strong>

                      <span
                        className={`risk-pill ${riskClass}`}
                      >
                        {location.riskLevel
                          ?.toUpperCase() ||
                          "UNKNOWN"}
                      </span>

                    </div>


                    <div className="coordinates-text">

                      <span>
                        Latitude:{" "}
                        {location.latitude ??
                          "--"}
                      </span>

                      <span>
                        Longitude:{" "}
                        {location.longitude ??
                          "--"}
                      </span>

                    </div>


                    <p>
                      {location.reason ||
                        "Risk area identified by the safety system."}
                    </p>

                  </div>


                  {/* SCORE */}

                  <div className="risk-score">

                    <span>
                      Risk Score
                    </span>

                    <strong>
                      {location.riskScore ??
                        "--"}
                    </strong>

                    <small>
                      / 100
                    </small>

                  </div>


                  {/* INCIDENTS */}

                  <div className="risk-incidents">

                    <Activity size={17} />

                    <div>

                      <strong>
                        {location.incidents ??
                          0}
                      </strong>

                      <span>
                        Incidents
                      </span>

                    </div>

                  </div>

                </div>

              );

            }

          )

        )}

      </div>


      {/* INFORMATION */}

      <div className="risk-info">

        <AlertTriangle size={18} />

        <div>

          <strong>
            About Risk Locations
          </strong>

          <p>
            These locations will eventually be
            identified using historical tourist
            safety data and the ML risk prediction
            model.
          </p>

        </div>

      </div>

    </div>

  );
}


export default RiskLocations;