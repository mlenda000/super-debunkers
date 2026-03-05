import Footer from "@/components/atoms/footer/Footer";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Header from "@/components/molecules/header/Header";
import NameSelection from "@/components/organisms/nameSelection/NameSelection";

const CharacterCreationPage = () => {
  return (
    <>
      <RotateScreen />
      <Header />
      <NameSelection />
      <Footer type="fixed" />
    </>
  );
};

export default CharacterCreationPage;
