export const PARTYKIT_HOST =
  import.meta.env.VITE_PARTYKIT_HOST ??
  (import.meta.env.MODE === "development"
    ? "127.0.0.1:1999"
    : "dfg-server.mlenda000.partykit.dev");
export const PROTOCOL = PARTYKIT_HOST.startsWith("127.0.0.1")
  ? "http"
  : "https";
export const PARTYKIT_URL = `${PROTOCOL}://${PARTYKIT_HOST}`;
