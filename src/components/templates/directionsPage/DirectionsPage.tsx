import { useState } from "react";
import Carousel from "@/components/organisms/carousel/Carousel";
import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import directionsDataRaw from "@/data/directionsData.json";
import type { SlideData } from "@/types/types";
import Footer from "@/components/atoms/footer/Footer";

const directionsData = directionsDataRaw as SlideData[];

const DirectionsPage = () => {
  const [isOnLastSlide, setIsOnLastSlide] = useState(false);

  return (
    <>
      <RotateScreen />
      <Header showPlayButton={isOnLastSlide} />
      <Carousel slides={directionsData} onSlideChange={setIsOnLastSlide} />
      <Footer type="fixed" />
    </>
  );
};

export default DirectionsPage;
