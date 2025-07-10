import { fetchWithAuth } from "./client";

export const fetchLocations = () => fetchWithAuth("/locations");
