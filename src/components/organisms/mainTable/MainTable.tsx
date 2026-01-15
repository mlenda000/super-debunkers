import React, { useEffect } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendWebSocketMessage } from "@/services/webSocketService";
import type { MainTableProps, ThemeStyle } from "@/types/types";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
// import NewsCard from "@/components/molecules/newsCard/NewsCard";
import influencerCards from "@/data/influencerCards.json";

const MainTable: React.FC<MainTableProps> = ({
  items,
  currentInfluencer,
  setCurrentInfluencer,
  finishRound,
  setFinishRound,
  setRoundEnd,
  setPlayersHandItems,
  originalItems,
  mainTableItems,
  setMainTableItems,
  setSubmitForScoring,
}) => {
  const { setThemeStyle } = useGlobalContext();

  const [playerReady, setPlayerReady] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>("");

  const gameCards = React.useMemo(
    () => (Array.isArray(influencerCards) ? [...influencerCards] : []),
    []
  );

  useEffect(() => {
    const resetTable = () => {
      setMessage("");
      setPlayersHandItems(originalItems);
      //   const filteredItems = mainTableItems.filter(
      //     (item) => item.collection !== "category_cards"
      //   );

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

  const indexRef = React.useRef(0);
  const newPlayerRef = React.useRef(true);
  useEffect(() => {
    if (Object.values(influencerCards)?.length > 0 && isDeckShuffled) {
      if (newPlayerRef.current) {
        setCurrentInfluencer(gameCards[gameRound - 1]);
        newPlayerRef.current = false; // Mark the player as no longer new
      }
    } else {
      console.log(
        "No influencer cards available or deck not shuffled yet. influencerCards:"
      );
    }
    if (gameRound === 5) {
      setFinalRound(true);
      setEndGame(true);
    }
  }, [setCurrentInfluencer, gameCards]);

  useEffect(() => {
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

      setPlayersHandItems([...items, cardToReturn]);
      if (updatedItems?.length === 0) {
        console.log("No cards left on the table");
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
  console.log(gameRoom.roomData);

  return (
    <div className="main-table">
      <div className="main-table__influencer">
        <NewsCard
          name={currentInfluencer?.caption}
          description={currentInfluencer?.bodyCopy}
          example="Influencer Example"
          category={currentInfluencer?.tacticUsed}
          villain={currentInfluencer?.villain as ThemeStyle} // type safety after NewsCardType update
          image={
            currentInfluencer?.newsImage
              ? `/images/influencer/${currentInfluencer.newsImage}`
              : `/images/influencer/scientist.png`
          }
          tacticUsed={currentInfluencer?.tacticUsed}
        />
      </div>
      <div className="main-table__tactics">
        <div
          className="main-table__background"
          style={finishRound ? { display: "none" } : { display: "block" }}
        >
          <img src={`/images/place-cards.png`} alt="Place cards" />
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
          <div onClick={handlePlayerReady} className="main-table__finish-round">
            <img
              src={
                !playerReady && finishRound
                  ? `/images/ready-button.png`
                  : playerReady && finishRound
                  ? `/images/checked-button.png`
                  : `/images/not-ready-button.png`
              }
              alt="Ready"
              width={"180%"}
              height={"auto"}
              style={{ cursor: "pointer" }}
            />
          </div>
        }
      </div>
    </div>
  );
};

export default MainTable;
