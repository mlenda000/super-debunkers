import { useState, useEffect } from "react";

import { Droppable } from "@/components/atoms/droppable/Droppable";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { sendWebSocketMessage } from "@/services/webSocketService";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import MainTable from "../mainTable/MainTable";
// import PlayersHand from "../playersHand/PlayersHand";
import categoryCards from "@/data/tacticsCards.json";

interface GameTableProps {
  setRoundEnd: (val: boolean) => void;
  roundHasEnded: boolean;
  setRoundHasEnded: (val: boolean) => void;
}

const GameTable: React.FC<GameTableProps> = ({
  setRoundEnd,
  roundHasEnded,
  setRoundHasEnded,
}) => {
  const { playerName } = useGlobalContext();
  const gameRoom = { roomData: [] } as any;
  const gameRound = 0;
  const currentInfluencer = null;
  const setCurrentInfluencer = () => {};

  const playersHand = Object.values(categoryCards)?.filter(
    (card) => card.image
  );
  const [mainTableItems, setMainTableItems] = useState<any[]>([]);
  const [finishRound, setFinishRound] = useState(false);
  const [submitForScoring, setSubmitForScoring] = useState(false);
  const [playersHandItems, setPlayersHandItems] = useState<any[]>(playersHand);

  const handleDrop = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id == null) {
      return;
    }
    if (active.id !== over.id) {
      const activeCard = playersHandItems.find((item) => item.id === active.id);
      setPlayersHandItems((items) =>
        items.filter((item) => item.id !== active.id)
      );
      const removeStartingText = mainTableItems.filter((card) => card.id !== 1);
      setMainTableItems([...removeStartingText, activeCard]);
    }
  };

  useEffect(() => {
    if (mainTableItems.length > 0) {
      setFinishRound(true);
    } else {
      setFinishRound(false);
    }
  }, [gameRoom.roomData, mainTableItems, playerName, setRoundEnd]);

  const allPlayersReady =
    Array.isArray(gameRoom?.roomData) &&
    gameRoom.roomData.length > 0 &&
    gameRoom.roomData.every(
      (player) => player?.status === true && player?.tacticUsed?.length > 0
    );

  useEffect(() => {
    if (allPlayersReady && !submitForScoring) {
      console.log(
        "All players are ready to finish the round and I am in the conditional"
      );
      setRoundHasEnded(true);
      // Moved handleFinishRound logic here
      const player = gameRoom.roomData.find((p: any) => p.name === playerName);
      console.log("Player in handleFinishRound after firing from conditional");
      sendWebSocketMessage({
        type: "endOfRound",
        players: [player],
        round: gameRound,
      });
      setRoundEnd(true);
      setSubmitForScoring(true);
      setRoundHasEnded(false);
    }
  }, [
    allPlayersReady,
    submitForScoring,
    gameRound,
    playerName,
    setRoundEnd,
    setRoundHasEnded,
    gameRoom.roomData,
  ]);

  return (
    <DndContext onDragEnd={handleDrop}>
      <div style={{ zIndex: 2 }} className="active-game-page">
        <div className="top-section">
          <Droppable className="main-table-droppable">
            <MainTable
              items={mainTableItems}
              round={gameRound}
              currentInfluencer={currentInfluencer}
              setCurrentInfluencer={(influencer) =>
                setCurrentInfluencer(influencer)
              }
              finishRound={finishRound}
              setFinishRound={setFinishRound}
              setRoundEnd={setRoundEnd}
              setPlayersHandItems={setPlayersHandItems}
              mainTableItems={mainTableItems}
              setMainTableItems={setMainTableItems}
              originalItems={playersHand}
              setSubmitForScoring={setSubmitForScoring}
            />
          </Droppable>
        </div>
        <div className="bottom-section">
          <PlayersHand items={playersHandItems} />
        </div>
      </div>
    </DndContext>
  );
};

export default GameTable;
