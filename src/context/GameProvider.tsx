import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { GameContext } from "@/context/GameContext";
import type {
  Player,
  Message,
  CustomState,
  GameRoom,
  NewsCard,
} from "@/types/gameTypes";
import type { TacticCardProps } from "@/types/types";
export const GameProvider = ({ children }: { children: ReactNode }) => {
  // --- State declarations ---
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [customState, setCustomState] = useState<CustomState>(null);
  const [gameRoom, setGameRoom] = useState<GameRoom>({
    count: 0,
    room: "",
    type: "",
    roomData: {
      count: 0,
      players: [],
      name: "",
    },
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [lastScoreUpdatePlayers, setLastScoreUpdatePlayers] = useState<
    Player[] | undefined
  >(undefined);
  const [tacticCards, setTacticCards] = useState<
    TacticCardProps[] | undefined
  >();
  const [newsCards, setNewsCards] = useState<NewsCard[]>([]);
  const [activeNewsCard, setActiveNewsCard] = useState<NewsCard | null>(null);
  const [gameRound, setGameRound] = useState<number>(1);
  const [endGame, setEndGame] = useState<boolean>(false);
  const [isDeckShuffled, setIsDeckShuffled] = useState<boolean>(false);
  const [finalRound, setFinalRound] = useState<boolean>(false);

  // --- Memoized values ---
  const memoCurrentPlayer = useMemo(() => currentPlayer, [currentPlayer]);
  const memoCustomState = useMemo(() => customState, [customState]);
  const memoGameRoom = useMemo(() => gameRoom, [gameRoom]);
  const memoMessages = useMemo(() => messages, [messages]);
  const memoPlayers = useMemo(() => players, [players]);
  const memoTacticCards = useMemo(() => tacticCards, [tacticCards]);
  const memoNewsCards = useMemo(() => newsCards, [newsCards]);
  const memoActiveNewsCard = useMemo(() => activeNewsCard, [activeNewsCard]);
  const memoGameRound = useMemo(() => gameRound, [gameRound]);
  const memoEndGame = useMemo(() => endGame, [endGame]);
  const memoIsDeckShuffled = useMemo(() => isDeckShuffled, [isDeckShuffled]);
  const memoFinalRound = useMemo(() => finalRound, [finalRound]);

  return (
    <GameContext.Provider
      value={{
        players: memoPlayers,
        setPlayers,
        lastScoreUpdatePlayers,
        setLastScoreUpdatePlayers,
        currentPlayer: memoCurrentPlayer,
        setCurrentPlayer,
        gameRoom: memoGameRoom,
        setGameRoom,
        messages: memoMessages,
        setMessages,
        customState: memoCustomState,
        setCustomState,
        tacticCards: memoTacticCards,
        setTacticCards,
        newsCards: memoNewsCards,
        setNewsCards,
        activeNewsCard: memoActiveNewsCard,
        setActiveNewsCard,
        gameRound: memoGameRound,
        setGameRound,
        endGame: memoEndGame,
        setEndGame,
        isDeckShuffled: memoIsDeckShuffled,
        setIsDeckShuffled,
        finalRound: memoFinalRound,
        setFinalRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
