export const publishActions = {
  UPDATE_CHAT: "UPDATE_CHAT",
  DELETE_CHAT: "DELETE_CHAT",
  ADD_USER: "ADD_USER",
  UPDTAE_LOCATION: "UPDTAE_LOCATION",
} as const;

export const trackerActions = {
  ADD_USER: "ADD_USER",
  UPDTAE_LOCATION: "UPDTAE_LOCATION",
  ERROR: "ERROR",
} as const;

const FRONTEND_DEV_URL = "http://localhost:5173";
const BACKEND_DEV_URL = "http://localhost:3000";
const BACKEND_DEV_WS_URL = "ws://localhost:3000";

export { FRONTEND_DEV_URL, BACKEND_DEV_URL, BACKEND_DEV_WS_URL };
