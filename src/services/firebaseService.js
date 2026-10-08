import {
  ref,
  set,
  push,
  serverTimestamp,
} from "firebase/database";

import { database } from "../firebase/firebase";


/*
  Create / update tourist profile
*/
export async function saveTourist(
  touristId,
  touristData
) {
  const touristRef = ref(
    database,
    `SafeTours/tourists/${touristId}`
  );

  await set(touristRef, {
    ...touristData,
    updatedAt: serverTimestamp(),
  });
}


/*
  Save current live location
*/
export async function saveLiveLocation(
  touristId,
  locationData
) {
  const locationRef = ref(
    database,
    `SafeTours/liveLocations/${touristId}`
  );

  await set(locationRef, {
    ...locationData,
    timestamp: serverTimestamp(),
  });
}


/*
  Add location to permanent history
*/
export async function saveLocationHistory(
  touristId,
  locationData
) {
  const historyRef = ref(
    database,
    "SafeTours/locationHistory"
  );

  const newLocation =
    push(historyRef);

  await set(newLocation, {
    touristId,

    ...locationData,

    timestamp: serverTimestamp(),
  });
}


/*
  Save an alert
*/
export async function saveAlert(
  touristId,
  alertData
) {
  const alertsRef = ref(
    database,
    "SafeTours/alerts"
  );

  const newAlert =
    push(alertsRef);

  await set(newAlert, {
    touristId,

    ...alertData,

    timestamp: serverTimestamp(),
  });
}