import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import { PARTYKIT_URL } from "@/services/env";
import {
  initializeWebSocket,
  getWebSocketInstance,
} from "@/services/webSocketService";
import { sendCreateRoom, sendUpdateAudioSettings } from "@/utils/gameMessageUtils";
import { isProfane } from "@/services/profanityFilter";
import "./styles/admin-page.css";

const TEACHER_PIN = "1234";

const AdminPage = () => {
  const navigate = useNavigate();
  const {
    sfxVolume,
    setSfxVolume,
    sfxMuted,
    setSfxMuted,
    musicMuted,
    setMusicMuted,
    volumeLocked,
    setVolumeLocked,
    teacherRooms,
    setTeacherRooms,
    teacherId,
    isTeacherAuthenticated,
    setIsTeacherAuthenticated,
  } = useGlobalContext();

  // Auth gate
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === TEACHER_PIN) {
      setIsTeacherAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
    setPinInput("");
  };

  // Room pre-generation state
  const [roomInput, setRoomInput] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Music volume (admin-controlled default)
  const [adminMusicVolume, setAdminMusicVolume] = useState(20);

  // Reset audio state to defaults on admin page entry (before auth).
  // Once the teacher authenticates and clicks "Save Settings",
  // their choices are persisted to localStorage.
  useEffect(() => {
    setSfxMuted(false);
    setMusicMuted(false);
    setVolumeLocked(false);
    setSfxVolume(20);
    setAdminMusicVolume(20);
  // Run only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync teacherRooms with server on mount — remove stale entries
  useEffect(() => {
    if (!isTeacherAuthenticated || teacherRooms.length === 0) return;

    const syncRooms = async () => {
      try {
        const response = await fetch(`${PARTYKIT_URL}/parties/main/lobby`);
        if (!response.ok) return;
        const data = await response.json();
        const serverRoomNames = new Set(
          (data.rooms || []).map((r: { name: string }) => r.name),
        );
        const valid = teacherRooms.filter((r) => serverRoomNames.has(r));
        if (valid.length !== teacherRooms.length) {
          setTeacherRooms(valid);
          localStorage.setItem("teacherRooms", JSON.stringify(valid));
        }
      } catch {
        // Server unreachable — keep local list as-is
      }
    };

    syncRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacherAuthenticated]);

  const showMessage = useCallback((text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleCreateRoom = async (roomName: string) => {
    const trimmed = roomName.trim();
    if (!trimmed) return;

    if (isProfane(trimmed)) {
      showMessage("Room name contains profanity.", "error");
      return;
    }

    if (teacherRooms.includes(trimmed)) {
      showMessage(`Room "${trimmed}" already in list.`, "error");
      return;
    }

    setIsCreating(true);
    try {
      // Create via HTTP POST (same as CreateRoom component)
      const response = await fetch(`${PARTYKIT_URL}/parties/main/lobby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: trimmed,
          teacherCreated: true,
          teacherId,
          volumeLocked,
          musicMuted,
          sfxMuted,
          musicVolume: adminMusicVolume,
          sfxVolume,
        }),
      });

      if (response.ok) {
        // Also notify via WebSocket
        await initializeWebSocket("lobby");
        const socket = getWebSocketInstance();
        sendCreateRoom(socket, trimmed);
        setTeacherRooms((prev: string[]) => {
          const updated = [...prev, trimmed];
          localStorage.setItem("teacherRooms", JSON.stringify(updated));
          return updated;
        });
        showMessage(`Room "${trimmed}" created.`, "success");
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || "Failed to create room.", "error");
      }
    } catch {
      // Fallback: create via WebSocket only
      try {
        await initializeWebSocket("lobby");
        const socket = getWebSocketInstance();
        sendCreateRoom(socket, trimmed);
        setTeacherRooms((prev: string[]) => {
          const updated = [...prev, trimmed];
          localStorage.setItem("teacherRooms", JSON.stringify(updated));
          return updated;
        });
        showMessage(`Room "${trimmed}" created (via WebSocket).`, "success");
      } catch {
        showMessage("Failed to create room.", "error");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitRoom = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateRoom(roomInput);
    setRoomInput("");
  };

  const handleBatchCreate = async () => {
    const names = roomInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setRoomInput("");
    for (const name of names) {
      await handleCreateRoom(name);
    }
  };

  // Broadcast current audio settings to all teacher rooms on the server
  const broadcastAudioSettings = async (overrides: {
    volumeLocked?: boolean;
    musicMuted?: boolean;
    sfxMuted?: boolean;
    musicVolume?: number;
    sfxVolume?: number;
  } = {}) => {
    const settings = {
      volumeLocked: overrides.volumeLocked ?? volumeLocked,
      musicMuted: overrides.musicMuted ?? musicMuted,
      sfxMuted: overrides.sfxMuted ?? sfxMuted,
      musicVolume: overrides.musicVolume ?? adminMusicVolume,
      sfxVolume: overrides.sfxVolume ?? sfxVolume,
    };
    try {
      await initializeWebSocket("lobby");
      const socket = getWebSocketInstance();
      for (const room of teacherRooms) {
        sendUpdateAudioSettings(socket, room, settings);
      }
    } catch {
      // Best-effort; localStorage backup via handleSaveSettings
    }
  };

  const handleVolumeLockToggle = () => {
    const newValue = !volumeLocked;
    setVolumeLocked(newValue);
    broadcastAudioSettings({ volumeLocked: newValue });
  };

  const handleDeleteRoom = async (roomName: string) => {
    try {
      const response = await fetch(
        `${PARTYKIT_URL}/parties/main/lobby?roomName=${encodeURIComponent(roomName)}&teacherId=${encodeURIComponent(teacherId)}`,
        { method: "DELETE" },
      );

      if (response.ok) {
        setTeacherRooms((prev: string[]) => {
          const updated = prev.filter((r) => r !== roomName);
          localStorage.setItem("teacherRooms", JSON.stringify(updated));
          return updated;
        });
        showMessage(`Room "${roomName}" removed.`, "success");
      } else {
        const errorData = await response.json();
        showMessage(errorData.error || "Failed to remove room.", "error");
      }
    } catch {
      showMessage("Failed to remove room.", "error");
    }
  };

  const handleObserveRoom = (roomName: string) => {
    navigate(`/game/${encodeURIComponent(roomName)}`, {
      state: { observer: true },
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("adminSfxVolume", String(sfxVolume));
    localStorage.setItem("adminSfxMuted", String(sfxMuted));
    localStorage.setItem("adminMusicMuted", String(musicMuted));
    localStorage.setItem("adminVolumeLocked", String(volumeLocked));
    localStorage.setItem("adminMusicVolume", String(adminMusicVolume));
    broadcastAudioSettings();
    showMessage("Settings saved.", "success");
  };

  const handleMuteAll = () => {
    setSfxMuted(true);
    setMusicMuted(true);
    setSfxVolume(0);
    setAdminMusicVolume(0);
    broadcastAudioSettings({ musicMuted: true, sfxMuted: true, musicVolume: 0, sfxVolume: 0 });
  };

  const handleUnmuteAll = () => {
    setSfxMuted(false);
    setMusicMuted(false);
    setSfxVolume(20);
    setAdminMusicVolume(20);
    broadcastAudioSettings({ musicMuted: false, sfxMuted: false, musicVolume: 20, sfxVolume: 20 });
  };

  const handleMuteMusicToggle = () => {
    const newValue = !musicMuted;
    setMusicMuted(newValue);
    const newVolume = newValue ? 0 : 20;
    setAdminMusicVolume(newVolume);
    broadcastAudioSettings({ musicMuted: newValue, musicVolume: newVolume });
  };

  return (
    <>
      <RotateScreen />
      <Header />
      <div className="admin-page">
        {!isTeacherAuthenticated ? (
          <div className="admin-page__login">
            <h1 className="admin-page__title">Teacher Login</h1>
            <form className="admin-page__pin-form" onSubmit={handlePinSubmit}>
              <label htmlFor="teacher-pin" className="admin-page__pin-label">
                Enter PIN to access the admin panel
              </label>
              <input
                id="teacher-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinError(false);
                  setPinInput(e.target.value);
                }}
                placeholder="PIN"
                className="admin-page__pin-input"
                aria-label="Teacher PIN"
                autoFocus
              />
              {pinError && (
                <p className="admin-page__pin-error" role="alert">
                  Incorrect PIN. Please try again.
                </p>
              )}
              <button
                type="submit"
                className="admin-page__btn admin-page__btn--primary"
                disabled={!pinInput.trim()}
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <h1 className="admin-page__title">Admin Panel</h1>

            <div className="admin-page__grid">
              {/* Left Column: Volume Controls + Results */}
              <div className="admin-page__col-left">
                {/* Volume Lock Section */}
                <section
                  className="admin-page__section"
                  aria-label="Volume controls"
                >
                  <h2 className="admin-page__section-title">Volume Control</h2>

                  <div className="admin-page__mute-buttons">
                    <button
                      type="button"
                      className="admin-page__btn admin-page__btn--danger"
                      onClick={
                        sfxMuted && musicMuted ? handleUnmuteAll : handleMuteAll
                      }
                    >
                      {sfxMuted && musicMuted ? "Unmute All" : "Mute All"}
                    </button>
                    <button
                      type="button"
                      className={`admin-page__btn ${musicMuted ? "admin-page__btn--primary" : "admin-page__btn--danger"}`}
                      onClick={handleMuteMusicToggle}
                    >
                      {musicMuted ? "Unmute Music" : "Mute Music"}
                    </button>
                  </div>

                  <div className="admin-page__volume-row">
                    <span className="admin-page__volume-label">Music</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adminMusicVolume}
                      onChange={(e) =>
                        setAdminMusicVolume(Number(e.target.value))
                      }
                      className="admin-page__volume-slider"
                      aria-label={`Admin music volume: ${adminMusicVolume}%`}
                    />
                    <span className="admin-page__volume-value">
                      {adminMusicVolume}%
                    </span>
                  </div>

                  <div className="admin-page__volume-row">
                    <span className="admin-page__volume-label">SFX</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sfxVolume}
                      onChange={(e) => setSfxVolume(Number(e.target.value))}
                      className="admin-page__volume-slider"
                      aria-label={`Admin SFX volume: ${sfxVolume}%`}
                    />
                    <span className="admin-page__volume-value">
                      {sfxVolume}%
                    </span>
                  </div>

                  <div className="admin-page__lock-row">
                    <label className="admin-page__lock-toggle">
                      <input
                        type="checkbox"
                        checked={volumeLocked}
                        onChange={handleVolumeLockToggle}
                      />
                      Lock volume for players
                    </label>
                    <span
                      className={`admin-page__lock-status ${
                        volumeLocked
                          ? "admin-page__lock-status--locked"
                          : "admin-page__lock-status--unlocked"
                      }`}
                    >
                      {volumeLocked ? "Locked" : "Unlocked"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-page__btn admin-page__btn--save"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </button>
                </section>

                {/* Game Results */}
                <section
                  className="admin-page__section"
                  aria-label="Game results"
                >
                  <h2 className="admin-page__section-title">Game Results</h2>
                  <button
                    type="button"
                    className="admin-page__btn admin-page__btn--primary"
                    style={{ width: "100%" }}
                    onClick={() => navigate("/admin/results")}
                  >
                    View Game Results
                  </button>
                </section>
              </div>

              {/* Right Column: Room Creation + Rooms List */}
              <div className="admin-page__col-right">
                <section
                  className="admin-page__section"
                  aria-label="Room management"
                >
                  <h2 className="admin-page__section-title">
                    Pre-generate Rooms
                  </h2>

                  {message && (
                    <div
                      className={`admin-page__message admin-page__message--${message.type}`}
                      role="status"
                    >
                      {message.text}
                    </div>
                  )}

                  <form
                    className="admin-page__room-form"
                    onSubmit={handleSubmitRoom}
                  >
                    <input
                      type="text"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      placeholder="Room name (or comma-separated)"
                      className="admin-page__room-input"
                      aria-label="Room name input"
                    />
                    <button
                      type="submit"
                      className="admin-page__btn admin-page__btn--primary"
                      disabled={isCreating || !roomInput.trim()}
                    >
                      Create
                    </button>
                  </form>

                  <button
                    type="button"
                    className="admin-page__btn admin-page__btn--primary"
                    onClick={handleBatchCreate}
                    disabled={isCreating || !roomInput.trim()}
                    style={{ marginBottom: "1rem", width: "100%" }}
                  >
                    {isCreating
                      ? "Creating..."
                      : "Batch Create (comma-separated)"}
                  </button>

                  <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Created Rooms
                  </h3>
                  {teacherRooms.length === 0 ? (
                    <p className="admin-page__room-empty">
                      No rooms created yet.
                    </p>
                  ) : (
                    <ul className="admin-page__room-list">
                      {teacherRooms.map((room) => (
                        <li key={room} className="admin-page__room-item">
                          <span className="admin-page__room-name">{room}</span>
                          <div className="admin-page__room-actions">
                            <button
                              type="button"
                              className="admin-page__btn admin-page__btn--observe"
                              onClick={() => handleObserveRoom(room)}
                              aria-label={`Observe room ${room}`}
                            >
                              Observe
                            </button>
                            <button
                              type="button"
                              className="admin-page__btn admin-page__btn--danger admin-page__btn--sm"
                              onClick={() => handleDeleteRoom(room)}
                              aria-label={`Remove room ${room}`}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminPage;
