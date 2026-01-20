import React, { useEffect } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendWebSocketMessage } from "@/services/webSocketService";
import type { MainTableProps, ThemeStyle } from "@/types/types";

// Ensure MainTableProps includes playersHandItems
// If not, extend the type here for local use (temporary fix)
type MainTablePropsWithHand = MainTableProps & {
  playersHandItems: any[];
  setPlayersHandItems: (items: any[]) => void;
};
import { useGameContext } from "@/hooks/useGameContext";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

const MainTable: React.FC<MainTablePropsWithHand> = ({
  items,
  currentInfluencer,
  setCurrentInfluencer,
  finishRound,
  setFinishRound,
  setRoundEnd,
  playersHandItems,
  setPlayersHandItems,
  originalItems,
  mainTableItems,
  setMainTableItems,
  setSubmitForScoring,
}) => {
  const { setThemeStyle } = useGlobalContext();
  const { gameRoom, gameRound, setEndGame, setFinalRound } = useGameContext();
  const [playerReady, setPlayerReady] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  const gameCards = React.useMemo(
    () =>
      Array.isArray(gameRoom.roomData.deck?.data)
        ? [...gameRoom.roomData.deck.data]
        : [],
    [gameRoom.roomData.deck]
  );
  const isDeckShuffled = React.useMemo(
    () => gameRoom.roomData.deck?.isShuffled,
    [gameRoom.roomData.deck]
  );

  useEffect(() => {
    const resetTable = () => {
      setMessage("");
      setPlayersHandItems(originalItems);
      setPlayerReady(false);
      setMainTableItems(originalItems);
      setSubmitForScoring(false);
    };
    if (message === "endOfRound") {
      resetTable();
      setTimeout(() => {
        setCurrentInfluencer(gameCards[indexRef.current]);
        indexRef.current++;
      }, 11000); // Wait for 11 seconds before setting the next influencer
    }
  }, [
    mainTableItems,
    originalItems,
    setMainTableItems,
    setPlayersHandItems,
    setRoundEnd,
    setSubmitForScoring,
    setCurrentInfluencer,
    gameCards,
    message,
  ]);

  console.log("current influencer:", currentInfluencer);

  const indexRef = React.useRef(0);
  const newPlayerRef = React.useRef(true);
  useEffect(() => {
    if (gameCards.length > 0 && isDeckShuffled) {
      if (newPlayerRef.current) {
        setCurrentInfluencer(gameCards[(gameRound ?? 1) - 1]);
        newPlayerRef.current = false; // Mark the player as no longer new
      } else {
        console.log("newPlayerRef.current is false, skipping influencer set");
      }
    } else {
      console.log(
        "Conditions not met - gameCards.length:",
        gameCards.length,
        "isDeckShuffled:",
        isDeckShuffled
      );
    }
    if (gameRound === 5) {
      setFinalRound?.(true);
      setEndGame?.(true);
    }
  }, [
    setCurrentInfluencer,
    gameCards,
    gameRound,
    setFinalRound,
    setEndGame,
    isDeckShuffled,
  ]);

  useEffect(() => {
    // Only send message if currentInfluencer is defined
    if (!currentInfluencer) return;

    // Ensure villain is ThemeStyle (cast for type safety after NewsCardType update)
    setThemeStyle((currentInfluencer?.villain as ThemeStyle) || "all");
    const messageRdyInfluencer = {
      type: "influencer",
      villain: currentInfluencer?.villain as ThemeStyle,
      tactic: Array.isArray(currentInfluencer?.tacticUsed)
        ? currentInfluencer?.tacticUsed
        : [currentInfluencer?.tacticUsed],
    };
    sendWebSocketMessage(messageRdyInfluencer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInfluencer]);

  const handlePlayerReady = () => {
    sendWebSocketMessage({ type: "playerReady", players: gameRoom?.roomData });
    setPlayerReady(true);
  };

  const handleReturnCard = (cardId: string) => {
    console.log("Card ID to return:", cardId);
    const cardToReturn = mainTableItems.find((item) => item.id === cardId);
    if (cardToReturn) {
      console.log("Card to return:", cardToReturn);
      const updatedItems = mainTableItems.filter((item) => item.id !== cardId);
      setMainTableItems(updatedItems);
      console.log("this is in the handleReturnCard function", items);
      setPlayersHandItems([...playersHandItems, cardToReturn]);
      if (updatedItems?.length === 0) {
        console.log("No cards left on the table");
        setPlayerReady(false);
        setFinishRound(false);
        sendWebSocketMessage({
          type: "playerNotReady",
          players: gameRoom?.roomData,
        });
      }
    }
  };
  console.log(gameRoom);

  return (
    <div className="main-table">
      <div className="main-table__influencer">
        <NewsCard
          name={currentInfluencer?.caption || ""}
          description={currentInfluencer?.bodyCopy || ""}
          example="Influencer Example"
          category={currentInfluencer?.tacticUsed || []}
          villain={currentInfluencer?.villain || "all"}
          image={
            currentInfluencer?.newsImage
              ? `/images/news/${currentInfluencer.newsImage}`
              : `/images/news/scientist.webp`
          }
          tacticUsed={currentInfluencer?.tacticUsed || []}
        />
      </div>
      <div className="main-table__tactics">
        <div
          className="main-table__background"
          style={finishRound ? { display: "none" } : { display: "block" }}
        >
          <p className="main-table__place-cards">Place Cards</p>
        </div>
        {items.map((card) => (
          <PlayedCard
            name={card?.title}
            category={card?.category}
            image={card?.image}
            alt={card?.alt}
            id={card?.id}
            key={card?.id}
            onUndo={() => handleReturnCard(card?.id)}
          />
        ))}
        {
          <button
            onClick={handlePlayerReady}
            className="main-table__finish-round"
          >
            <img
              src={
                !playerReady && finishRound
                  ? `/images/buttons/ready-button.webp`
                  : playerReady && finishRound
                    ? `/images/buttons/checked-button.webp`
                    : `/images/buttons/not-ready-button.webp`
              }
              alt="Ready"
              width={"180%"}
              height={"auto"}
              style={{ cursor: "pointer", maxWidth: "100px" }}
            />
          </button>
        }
      </div>
    </div>
  );
};

export default MainTable;
