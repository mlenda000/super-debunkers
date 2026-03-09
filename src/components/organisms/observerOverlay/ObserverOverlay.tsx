import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "@/hooks/useGameContext";
import { getWebSocketInstance } from "@/services/webSocketService";
import { sendForceReady, sendReadyCountdown } from "@/utils/gameMessageUtils";
import type { Player } from "@/types/gameTypes";
import {
  resolveSourcePlayers,
  resolveScoredPlayers,
  isTacticCorrect,
  getPlayerResultLabel,
  isPartialCorrect,
} from "./observerOverlayUtils";
import "./styles/observer-overlay.css";

interface ObserverOverlayProps {
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string | null) => void;
  playerCountdowns: Record<string, number>;
}

const ObserverOverlay = ({
  selectedPlayerId,
  onSelectPlayer,
  playerCountdowns,
}: ObserverOverlayProps) => {
  const navigate = useNavigate();
  const {
    gameRoom,
    players,
    lastScoreUpdatePlayers,
    activeNewsCard,
    previousNewsCard,
    gameRound,
  } = useGameContext();

  const sourcePlayers = resolveSourcePlayers(
    gameRoom?.roomData?.players as Player[] | undefined,
    players as Player[],
  );

  const scoredPlayers = resolveScoredPlayers(
    lastScoreUpdatePlayers as Player[] | undefined,
    sourcePlayers,
  );

  // Merge live isReady/tacticUsed status from sourcePlayers into scoredPlayers
  // so the observer always sees current ready state (not stale post-scoring state).
  // Also clear stale scoring results when a new round has started.
  const mergedPlayers = scoredPlayers.map((sp) => {
    const live = sourcePlayers.find((p) => p.id === sp.id);
    if (!live) return sp;
    const isNewRound =
      !live.isReady && (!live.tacticUsed || live.tacticUsed.length === 0);
    return {
      ...sp,
      isReady: live.isReady,
      tacticUsed: live.tacticUsed,
      // Clear stale scoring results when the round has reset
      ...(isNewRound
        ? {
            wasCorrect: undefined,
            correctCount: undefined,
            totalPlayed: undefined,
          }
        : {}),
    };
  });

  // For the observer, prefer the active (current round) news card so they see
  // what's happening live. Fall back to previousNewsCard only between rounds.
  const displayCard = activeNewsCard ?? previousNewsCard ?? null;

  const cardTactics = displayCard?.tacticUsed ?? [];

  const roomName = gameRoom?.room || gameRoom?.roomData?.name || "";

  const handleForceReady = useCallback(
    (playerId: string) => {
      const socket = getWebSocketInstance();
      sendForceReady(socket, roomName, playerId);
    },
    [roomName],
  );

  const handleStartCountdown = useCallback(
    (playerId: string) => {
      const socket = getWebSocketInstance();
      sendReadyCountdown(socket, roomName, playerId, 30);
    },
    [roomName],
  );

  return (
    <div className="observer-overlay">
      <div className="observer-overlay__header">
        <h2 className="observer-overlay__title">
          Observer — Round {gameRound ?? 1}
        </h2>
        <div className="observer-overlay__header-actions">
          <button
            className="observer-overlay__admin-btn"
            onClick={() => navigate("/admin")}
            aria-label="Back to Admin Panel"
          >
            Back to Admin Panel
          </button>
        </div>
      </div>

      {/* Player selection list */}
      <div className="observer-overlay__player-list">
        <button
          className={`observer-overlay__player-btn ${
            selectedPlayerId === null
              ? "observer-overlay__player-btn--active"
              : ""
          }`}
          onClick={() => onSelectPlayer(null)}
        >
          Summary View
        </button>
        {sourcePlayers.map((player) => (
          <button
            key={player.id}
            className={`observer-overlay__player-btn ${
              selectedPlayerId === player.id
                ? "observer-overlay__player-btn--active"
                : ""
            }`}
            onClick={() => onSelectPlayer(player.id)}
          >
            <img
              src={`/images/avatars/${player.avatar}`}
              alt=""
              className="observer-overlay__avatar"
            />
            <span className="observer-overlay__player-name">{player.name}</span>
            <span className="observer-overlay__player-score">
              {player.score ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Summary view (when no player is selected) */}
      {selectedPlayerId === null && (
        <div className="observer-overlay__summary">
          {/* News card info */}
          {displayCard && (
            <div className="observer-overlay__card-info">
              <h3 className="observer-overlay__section-title">News Card</h3>
              <p className="observer-overlay__card-caption">
                {displayCard.caption}
              </p>
              {cardTactics.length > 0 && (
                <div className="observer-overlay__tactics">
                  <span className="observer-overlay__tactics-label">
                    Actual Tactics:
                  </span>
                  {cardTactics.map((tactic, i) => (
                    <span key={i} className="observer-overlay__tactic-badge">
                      {tactic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All players breakdown */}
          <div className="observer-overlay__players-summary">
            <h3 className="observer-overlay__section-title">Players</h3>
            {mergedPlayers
              .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
              .map((player) => (
                <div key={player.id} className="observer-overlay__player-row">
                  <div className="observer-overlay__player-info">
                    <img
                      src={`/images/avatars/${player.avatar}`}
                      alt=""
                      className="observer-overlay__avatar observer-overlay__avatar--sm"
                    />
                    <span className="observer-overlay__player-name">
                      {player.name}
                    </span>
                  </div>
                  <div className="observer-overlay__player-details">
                    {/* Tactics played */}
                    <div className="observer-overlay__played-tactics">
                      {player.tacticUsed && player.tacticUsed.length > 0 ? (
                        player.tacticUsed.map((t, i) => (
                          <span
                            key={i}
                            className={`observer-overlay__tactic-badge ${
                              isTacticCorrect(t, cardTactics)
                                ? "observer-overlay__tactic-badge--correct"
                                : "observer-overlay__tactic-badge--wrong"
                            }`}
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="observer-overlay__waiting">
                          {player.isReady ? "Ready" : "Choosing..."}
                        </span>
                      )}
                    </div>
                    {/* Force ready / countdown controls for unready players */}
                    {!player.isReady && (
                      <div className="observer-overlay__player-actions">
                        {playerCountdowns[player.id] != null ? (
                          <span className="observer-overlay__countdown-display">
                            ⏱ {playerCountdowns[player.id]}s
                          </span>
                        ) : (
                          <>
                            <button
                              className="observer-overlay__countdown-btn"
                              onClick={() => handleStartCountdown(player.id)}
                              aria-label={`Start 30s countdown for ${player.name}`}
                            >
                              ⏱ 30s
                            </button>
                            <button
                              className="observer-overlay__force-ready-btn"
                              onClick={() => handleForceReady(player.id)}
                              aria-label={`Force ${player.name} ready`}
                            >
                              Force Ready
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {/* Result & Score */}
                    <div className="observer-overlay__player-result">
                      {typeof player.wasCorrect !== "undefined" && (
                        <span
                          className={`observer-overlay__result-badge ${
                            player.wasCorrect
                              ? "observer-overlay__result-badge--correct"
                              : "observer-overlay__result-badge--wrong"
                          }`}
                        >
                          {player.wasCorrect ? "✓" : "✗"}
                        </span>
                      )}
                      <span className="observer-overlay__score">
                        {player.score ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Selected player view */}
      {selectedPlayerId !== null && (
        <SelectedPlayerView
          playerId={selectedPlayerId}
          players={mergedPlayers}
          cardTactics={cardTactics}
          playerCountdowns={playerCountdowns}
          onForceReady={handleForceReady}
          onStartCountdown={handleStartCountdown}
        />
      )}
    </div>
  );
};

/** Detail view when mirroring a specific player */
function SelectedPlayerView({
  playerId,
  players,
  cardTactics,
  playerCountdowns,
  onForceReady,
  onStartCountdown,
}: {
  playerId: string;
  players: Player[];
  cardTactics: string[];
  playerCountdowns: Record<string, number>;
  onForceReady: (playerId: string) => void;
  onStartCountdown: (playerId: string) => void;
}) {
  const player = players.find((p) => p.id === playerId);

  if (!player) {
    return (
      <div className="observer-overlay__selected-empty">
        Player not found. They may have disconnected.
      </div>
    );
  }

  const resultLabel = getPlayerResultLabel(player);
  const partial = isPartialCorrect(player);

  return (
    <div className="observer-overlay__selected">
      <div className="observer-overlay__selected-header">
        <img
          src={`/images/avatars/${player.avatar}`}
          alt=""
          className="observer-overlay__avatar observer-overlay__avatar--lg"
        />
        <div>
          <h3 className="observer-overlay__selected-name">{player.name}</h3>
          <span className="observer-overlay__selected-score">
            {player.score ?? 0} Followers
          </span>
          {player.streak !== undefined && player.streak > 0 && (
            <span className="observer-overlay__streak">
              🔥 {player.streak} streak
            </span>
          )}
        </div>
      </div>

      {/* What they played */}
      <div className="observer-overlay__selected-section">
        <h4 className="observer-overlay__section-title">Tactics Played</h4>
        <div className="observer-overlay__played-tactics">
          {player.tacticUsed && player.tacticUsed.length > 0 ? (
            player.tacticUsed.map((t, i) => (
              <span
                key={i}
                className={`observer-overlay__tactic-badge ${
                  isTacticCorrect(t, cardTactics)
                    ? "observer-overlay__tactic-badge--correct"
                    : "observer-overlay__tactic-badge--wrong"
                }`}
              >
                {t}
              </span>
            ))
          ) : (
            <span className="observer-overlay__waiting">
              {player.isReady
                ? "Ready — no tactics placed"
                : "Still choosing..."}
            </span>
          )}
        </div>
      </div>

      {/* Their result */}
      {resultLabel && (
        <div className="observer-overlay__selected-section">
          <h4 className="observer-overlay__section-title">Result</h4>
          <div
            className={`observer-overlay__result-display ${
              player.wasCorrect
                ? "observer-overlay__result-display--correct"
                : "observer-overlay__result-display--wrong"
            }`}
          >
            <span className="observer-overlay__result-label">
              {resultLabel}
            </span>
            {partial && (
              <span className="observer-overlay__result-detail">
                {player.correctCount} / {player.totalPlayed} correct
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="observer-overlay__selected-section">
        <h4 className="observer-overlay__section-title">Status</h4>
        <span
          className={`observer-overlay__status ${
            player.isReady
              ? "observer-overlay__status--ready"
              : "observer-overlay__status--waiting"
          }`}
        >
          {player.isReady ? "Ready" : "Choosing tactics..."}
        </span>
        {!player.isReady && (
          <div className="observer-overlay__player-actions">
            {playerCountdowns[player.id] != null ? (
              <span className="observer-overlay__countdown-display">
                ⏱ {playerCountdowns[player.id]}s
              </span>
            ) : (
              <>
                <button
                  className="observer-overlay__countdown-btn"
                  onClick={() => onStartCountdown(player.id)}
                  aria-label={`Start 30s countdown for ${player.name}`}
                >
                  ⏱ 30s
                </button>
                <button
                  className="observer-overlay__force-ready-btn"
                  onClick={() => onForceReady(player.id)}
                  aria-label={`Force ${player.name} ready`}
                >
                  Force Ready
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ObserverOverlay;
