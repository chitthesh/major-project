import { useEffect, useState } from "react";

import {
  ref,
  onValue,
} from "firebase/database";

import {
  Search,
  Plus,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

import { database } from "../firebase/firebase";


function Tourists() {

  const [tourists, setTourists] = useState({});
  const [search, setSearch] = useState("");


  useEffect(() => {

    const touristsRef =
      ref(database, "SafeTours/tourists");

    return onValue(
      touristsRef,
      (snapshot) => {

        setTourists(
          snapshot.val() || {}
        );

      }
    );

  }, []);


  const touristList = Object.entries(
    tourists
  ).map(([id, data]) => ({
    id,
    ...data,
  }));


  const filteredTourists =
    touristList.filter((tourist) => {

      const searchText =
        search.toLowerCase();

      return (
        tourist.id
          ?.toLowerCase()
          .includes(searchText) ||

        tourist.name
          ?.toLowerCase()
          .includes(searchText) ||

        tourist.deviceId
          ?.toLowerCase()
          .includes(searchText)
      );

    });


  function getStatusIcon(status) {

    if (status === "danger") {
      return (
        <ShieldAlert size={16} />
      );
    }

    if (status === "warning") {
      return (
        <AlertTriangle size={16} />
      );
    }

    return (
      <ShieldCheck size={16} />
    );

  }


  return (

    <div className="page-container">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h2>Tourists</h2>

          <p>
            Monitor and manage registered travelers
          </p>

        </div>


        <button className="add-tourist">

          <Plus size={17} />

          Add Tourist

        </button>

      </div>


      {/* TOOLBAR */}

      <div className="tourist-toolbar">

        <div className="tourist-search">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search tourists..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <div className="tourist-count">

          {touristList.length}{" "}

          {touristList.length === 1
            ? "Tourist"
            : "Tourists"}

        </div>

      </div>


      {/* TABLE */}

      <div className="tourist-table">

        <div className="table-header">

          <span>ID</span>

          <span>Tourist</span>

          <span>Device</span>

          <span>Status</span>

          <span>Location</span>

        </div>


        {filteredTourists.length === 0 ? (

          <div className="no-tourists">

            No tourists found.

          </div>

        ) : (

          filteredTourists.map(
            (tourist) => (

              <div
                className="table-row"
                key={tourist.id}
              >

                <span className="tourist-id">

                  {tourist.id}

                </span>


                <div className="tourist-name">

                  <div className="tourist-small-avatar">

                    {tourist.id
                      ?.slice(-1)}

                  </div>

                  <div>

                    <strong>
                      {tourist.name}
                    </strong>

                    <small>
                      Registered traveler
                    </small>

                  </div>

                </div>


                <span className="device-id">

                  {tourist.deviceId}

                </span>


                <span>

                  <span
                    className={`status-pill ${tourist.status}`}
                  >

                    {getStatusIcon(
                      tourist.status
                    )}

                    {tourist.status
                      ?.toUpperCase()}

                  </span>

                </span>


                <span>

                  <button className="location-button">

                    <MapPin size={15} />

                    View location

                  </button>

                </span>

              </div>

            )
          )

        )}

      </div>

    </div>

  );
}


export default Tourists;