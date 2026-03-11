import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/molecules/header/Header";
import { PARTYKIT_URL } from "@/services/env";
import {
  initializeWebSocket,
  subscribeToMessages,
} from "@/services/webSocketService";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import type { GameResult } from "@/types/gameTypes";
import "./styles/game-results-page.css";

const TEACHER_PIN = "1234";

const GameResultsPage = () => {
  const navigate = useNavigate();
  const { teacherId, isTeacherAuthenticated, setIsTeacherAuthenticated } =
    useGlobalContext();
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(new Set());

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

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${PARTYKIT_URL}/parties/main/lobby?gameResults=true&teacherId=${encodeURIComponent(teacherId)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.gameResults) {
          setGameResults(data.gameResults);
        }
      }
    } catch (err) {
      console.error("Failed to fetch game results:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  // Fetch results on auth and subscribe to real-time updates
  useEffect(() => {
    if (!isTeacherAuthenticated) return;

    fetchResults();

    let unsubscribe: (() => void) | null = null;

    const setupWebSocket = async () => {
      try {
        await initializeWebSocket("lobby");
        unsubscribe = subscribeToMessages((message) => {
          if (message.type === "gameResultsUpdated") {
            const parsed = message as unknown as {
              teacherId?: string;
              gameResult?: GameResult;
            };
            // Only add the result if it belongs to this teacher
            if (parsed.teacherId === teacherId && parsed.gameResult) {
              setGameResults((prev) => [...prev, parsed.gameResult!]);
            }
          }
        });
      } catch (err) {
        console.error("Failed to connect to WebSocket for results:", err);
      }
    };

    setupWebSocket();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isTeacherAuthenticated, fetchResults, teacherId]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUnlockRoom = async (roomName: string) => {
    try {
      await fetch(
        `${PARTYKIT_URL}/parties/main/${encodeURIComponent(roomName)}?unlockRoom=true`,
        { method: "POST" },
      );
      setUnlockedRooms((prev) => new Set(prev).add(roomName));
    } catch {
      // Best-effort
    }
  };

  return (
    <>
      <Header />
      <div className="game-results-page">
        {!isTeacherAuthenticated ? (
          <div className="game-results-page__login">
            <h1 className="game-results-page__title">Teacher Login</h1>
            <form
              className="game-results-page__pin-form"
              onSubmit={handlePinSubmit}
            >
              <label
                htmlFor="teacher-pin"
                className="game-results-page__pin-label"
              >
                Enter PIN to view game results
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
                className="game-results-page__pin-input"
                aria-label="Teacher PIN"
                autoFocus
              />
              {pinError && (
                <p className="game-results-page__pin-error" role="alert">
                  Incorrect PIN. Please try again.
                </p>
              )}
              <button
                type="submit"
                className="game-results-page__btn game-results-page__btn--primary"
                disabled={!pinInput.trim()}
              >
                Login
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="game-results-page__header-row">
              <h1 className="game-results-page__title">Game Results</h1>
              <div className="game-results-page__actions">
                <button
                  type="button"
                  className="game-results-page__btn game-results-page__btn--secondary"
                  onClick={fetchResults}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Refresh"}
                </button>
                <button
                  type="button"
                  className="game-results-page__btn game-results-page__btn--secondary"
                  onClick={() => navigate("/admin")}
                >
                  Back to Admin
                </button>
              </div>
            </div>

            {gameResults.length === 0 ? (
              <div className="game-results-page__empty">
                <p>No game results yet.</p>
                <p>Results will appear here when teacher-created games end.</p>
              </div>
            ) : (
              <div className="game-results-page__grid">
                {gameResults.map((result, index) => (
                  <div
                    key={`${result.roomName}-${index}`}
                    className="game-results-page__card"
                  >
                    <div className="game-results-page__card-header">
                      <h2 className="game-results-page__room-name">
                        {result.roomName}
                      </h2>
                      <div className="game-results-page__card-meta">
                        <span className="game-results-page__time">
                          {formatTime(result.completedAt)}
                        </span>
                        {unlockedRooms.has(result.roomName) ? (
                          <span className="game-results-page__unlocked-badge">
                            ✓ Unlocked
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="game-results-page__unlock-btn"
                            onClick={() => handleUnlockRoom(result.roomName)}
                          >
                            Unlock Room
                          </button>
                        )}
                      </div>
                    </div>
                    <table className="game-results-page__table">
                      <thead>
                        <tr>
                          <th className="game-results-page__th">Rank</th>
                          <th className="game-results-page__th">Player</th>
                          <th className="game-results-page__th game-results-page__th--score">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...result.players]
                          .sort((a, b) => b.score - a.score)
                          .map((player, rank) => (
                            <tr
                              key={player.name}
                              className={`game-results-page__row ${
                                rank === 0
                                  ? "game-results-page__row--first"
                                  : ""
                              }`}
                            >
                              <td className="game-results-page__td game-results-page__td--rank">
                                {rank === 0 ? "🏆" : rank + 1}
                              </td>
                              <td className="game-results-page__td game-results-page__td--player">
                                {player.avatar && (
                                  <img
                                    src={`/images/avatars/${player.avatar}`}
                                    alt=""
                                    className="game-results-page__avatar"
                                  />
                                )}
                                <span>{player.name}</span>
                              </td>
                              <td className="game-results-page__td game-results-page__td--score">
                                {player.score}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default GameResultsPage;
