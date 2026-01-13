import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Header from "@/components/molecules/header/Header";
import PlayerSelection from "@/components/organisms/playerSelection/PlayerSelection";

const CharacterCreationPage = () => {
  return (
    <>
      <RotateScreen />
      <Header />
      <PlayerSelection />
    </>
  );
};

export default CharacterCreationPage;
