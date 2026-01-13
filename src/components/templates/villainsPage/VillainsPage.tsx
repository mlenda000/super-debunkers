import Carousel from "@/components/organisms/carousel/Carousel";
import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import villainSlides from "@/data/villainsData.json";

const VillainsPage = () => {
  return (
    <>
      <RotateScreen />
      <Header />
      <Carousel slides={villainSlides} />
    </>
  );
};

export default VillainsPage;
