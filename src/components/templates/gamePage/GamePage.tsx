import { useState } from "react";
// import Scoreboard from "@/components/organisms/scoreboard/Scoreboard";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import GameTable from "@/components/organisms/gameTable/GameTable";
import ResultModal from "@/components/organisms/modals/resultModal/ResultModal";
import RoundModal from "@/components/organisms/modals/roundModal/RoundModal";
import ResponseModal from "@/components/organisms/modals/responseModal/ResponseModal";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import InfoModal from "@/components/organisms/modals/infoModal/InfoModal";

const GamePage = () => {
  // const [finalRound, setFinalRound] = useState<boolean>(false);

  // TODO: Aaron change these from false to true to test modals and see them on the gamepage
  const [roundStart] = useState<boolean>(false);
  const [roundEnd, setRoundEnd] = useState<boolean>(false);
  const [roundHasEnded, setRoundHasEnded] = useState<boolean>(false);
  const [isEndGame, setIsEndGame] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [showResponseModal, setShowResponseModal] = useState<boolean>(false);
  const [showScoreCard, setShowScoreCard] = useState<boolean>(false);

  return (
    <>
      <RotateScreen />
      <GameTable
        setRoundEnd={(value: boolean | ((prevState: boolean) => boolean)) =>
          setRoundEnd(value)
        }
        roundHasEnded={roundHasEnded}
        setRoundHasEnded={setRoundHasEnded}
      />
      {roundStart && <RoundModal />}
      {roundEnd && (
        <ResultModal
          setRoundEnd={setRoundEnd}
          setShowResponseModal={setShowResponseModal}
        />
      )}
      {showResponseModal && (
        <ResponseModal
          setShowScoreCard={setShowScoreCard}
          setShowResponseModal={setShowResponseModal}
        />
      )}
      {showScoreCard && <ScoreModal setIsEndGame={setIsEndGame} />}
      {isEndGame && <EndGameModal setIsEndGame={setIsEndGame} />}
      {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={setIsInfoModalOpen} />
      )}
    </>
  );
};

export default GamePage;
