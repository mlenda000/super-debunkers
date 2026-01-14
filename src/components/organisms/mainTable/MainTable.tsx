import React, { useEffect } from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { sendWebSocketMessage } from "@/services/webSocketService";
import influencerCards from "@/data/influencerCards.json";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";

interface TacticCardType {
  id: string;
  name: string;
  imageUrl?: string;
  description?: string;
}

interface InfluencerCardType {
  caption: string;
  bodyCopy: string;
  villain: string;
  tacticUsed: string[];
  newsImage?: string;
}

interface MainTableProps {
  items: TacticCardType[];
  currentInfluencer: InfluencerCardType | null;
  setCurrentInfluencer: (influencer: InfluencerCardType) => void;
  finishRound: boolean;
  setFinishRound: (val: boolean) => void;
  setRoundEnd: (val: boolean) => void;
  setPlayersHandItems: (items: TacticCardType[]) => void;
  originalItems: TacticCardType[];
  mainTableItems: TacticCardType[];
  setMainTableItems: (items: TacticCardType[]) => void;
  setSubmitForScoring: (val: boolean) => void;
}

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
      const filteredItems = mainTableItems.filter(
        (item) => item.collection !== "category_cards"
      );

      setPlayerReady(false);
      setMainTableItems(filteredItems);
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
    if (influencerCards?.length > 0 && isDeckShuffled) {
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
    setThemeStyle(currentInfluencer?.villain);
    const messageRdyInfluencer = {
      type: "influencer",
      villain: currentInfluencer?.villain,
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
        <InfluencerCard
          name={currentInfluencer?.caption}
          description={currentInfluencer?.bodyCopy}
          example="Influencer Example"
          category={currentInfluencer?.tacticUsed}
          villain={currentInfluencer?.villain}
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
            //                 category
            //   image,
            //   example,
            //   alt,
            //   imageBack,
            //   description,
            //   className
            category={card?.category}
            image={card?.image}
            alt={card?.alt}
            description={card?.description}
            id={card?.id}
            key={card?.id}
            onUndo={handleReturnCard}
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
