import { useState } from "react";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import "./styles/game-page.css";

const GamePage = () => {
  // const [tacticCards, setTacticCards] = useState<any>();
  // const [newsCards, setNewsCards] = useState<any[]>([]);
  // const [activeNewsCard, setActiveNewsCard] = useState<any>(null);
  // const [gameRound, setGameRound] = useState<number>(1);
  // const [players, setPlayers] = useState<Player[]>([]);
  // const [showScoringModal, setShowScoringModal] = useState<boolean>(false);
  //   const [showResponseModal, setShowResponseModal] = useState<any>(null);
  //   const [showScoreCard, setShowScoreCard] = useState<boolean>(false);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  //   const [roundStart, setRoundStart] = useState<boolean>(false);
  // const [finalRound, setFinalRound] = useState<boolean>(false);
  // const [endGame, setEndGame] = useState<boolean>(false);
  //   const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  //   const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  // const [waitingForPlayers, setWaitingForPlayers] = useState<boolean>(false);

  return (
    <>
      <RotateScreen />
      {/* <Scoreboard
        roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
        isInfoModalOpen={isInfoModalOpen}
        setIsInfoModalOpen={setIsInfoModalOpen}
      /> */}
      <GameProvider>
        <GameTable
          setRoundEnd={(value: boolean | ((prevState: boolean) => boolean)) =>
            setRoundEnd(value)
          }
          roundHasEnded={roundHasEnded}
          setRoundHasEnded={setRoundHasEnded}
        />
        {/* {waitingForPlayers && (
              <WaitingModal setWaitingForPlayers={setWaitingForPlayers} />
            )} */}
        {/* {roundStart && <RoundModal />}
      {roundEnd && <ResultModal />}
      {showResponseModal && <ResponseModal />}
      {showScoreCard && <ScoreModal setIsEndGame={setIsEndGame} />}
      {isEndGame && <EndGameModal setIsEndGame={setIsEndGame} />}
      {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={setIsInfoModalOpen} /> 
      )}*/}
      </GameProvider>
    </>
  );
};

export default GamePage;
