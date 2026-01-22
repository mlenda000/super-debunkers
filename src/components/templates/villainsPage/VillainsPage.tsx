import { useState } from "react";
import Carousel from "@/components/organisms/carousel/Carousel";
import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import villainSlides from "@/data/villainsData.json";

const VillainsPage = () => {
  const [isOnLastSlide, setIsOnLastSlide] = useState(false);

  return (
    <>
      <RotateScreen />
      <Header showPlayButton={isOnLastSlide} />
      <Carousel slides={villainSlides} onSlideChange={setIsOnLastSlide} />
    </>
  );
};

export default VillainsPage;
