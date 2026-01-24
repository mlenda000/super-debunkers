const PARTYKIT_HOST_CONFIG =
  import.meta.env.VITE_PARTYKIT_HOST ??
  (import.meta.env.MODE === "development"
    ? "127.0.0.1:1999"
    : "dfg-server.mlenda000.partykit.dev");

// Export host with port for PartySocket
export const PARTYKIT_HOST = PARTYKIT_HOST_CONFIG;

export const PROTOCOL =
  PARTYKIT_HOST.startsWith("127.0.0.1") || PARTYKIT_HOST.startsWith("localhost")
    ? "http"
    : "https";

export const PARTYKIT_URL = `${PROTOCOL}://${PARTYKIT_HOST}`;
