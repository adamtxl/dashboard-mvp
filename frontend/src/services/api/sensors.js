import { fetchWithAuth } from "./client";

export const fetchSensors = () => fetchWithAuth("/sensors");
