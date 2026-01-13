import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Header from "@/components/molecules/header/Header";
import NameSelection from "@/components/organisms/nameSelection/NameSelection";

const CharacterCreationPage = () => {
  return (
    <>
      <RotateScreen />
      <Header />
      <NameSelection />
    </>
  );
};

export default CharacterCreationPage;
