import Footer from "@/components/atoms/footer/Footer";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Header from "@/components/molecules/header/Header";
import PlayerSelection from "@/components/organisms/playerSelection/PlayerSelection";

const CharacterCreationPage = () => {
  return (
    <>
      <RotateScreen />
      <Header />
      <PlayerSelection />
      <Footer type="mini" />
    </>
  );
};

export default CharacterCreationPage;
