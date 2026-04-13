/**
 * Replaces spaces in a room name with hyphens to prevent
 * URL-encoding mismatches between PartySocket and the server.
 */
export const sanitizeRoomName = (name: string): string => {
  return name.replace(/\s+/g, "-");
};
