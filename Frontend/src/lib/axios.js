import axios from "axios";

const BASE_URL = "http://localhost:3000/api"; // expressjs server url
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // allow parsing token to cookies
});

export default api;
