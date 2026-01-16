import { useState } from "react";
// import Scoreboard from "@/components/organisms/scoreboard/Scoreboard";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import ResultModal from "@/components/organisms/resultModal/ResultModal";

const GamePage = () => {
  //   const [roundStart, setRoundStart] = useState<boolean>(false);
  // const [finalRound, setFinalRound] = useState<boolean>(false);

  // const [waitingForPlayers, setWaitingForPlayers] = useState<boolean>(false);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  //   const [isEndGame, setIsEndGame] = useState<boolean>(false);
  //   const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  // const [showScoringModal, setShowScoringModal] = useState<boolean>(false);
  //   const [showResponseModal, setShowResponseModal] = useState<any>(null);
  //   const [showScoreCard, setShowScoreCard] = useState<boolean>(false);

  return (
    <>
      <RotateScreen />
      {/* <Scoreboard
        roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
        isInfoModalOpen={isInfoModalOpen}
        setIsInfoModalOpen={setIsInfoModalOpen}
      /> */}
      <GameTable
        setRoundEnd={(value: boolean | ((prevState: boolean) => boolean)) =>
          setRoundEnd(value)
        }
        //   roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
      />
      {/* {waitingForPlayers && (
              <WaitingModal setWaitingForPlayers={setWaitingForPlayers} />
            )} */}
      {/* {roundStart && <RoundModal />} */}
      {roundEnd && <ResultModal />}
      {/* {showResponseModal && <ResponseModal />} */}
      {/* {showScoreCard && <ScoreModal setIsEndGame={setIsEndGame} />} */}
      {/* {isEndGame && <EndGameModal setIsEndGame={setIsEndGame} />} */}
      {/* {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={setIsInfoModalOpen} /> 
      )}*/}
    </>
  );
};

export default GamePage;
