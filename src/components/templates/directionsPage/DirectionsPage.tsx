import Carousel from "@/components/organisms/carousel/Carousel";
import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import directionsDataRaw from "@/data/directionsData.json";
import type { SlideData } from "@/types/types";

const directionsData = directionsDataRaw as SlideData[];

const DirectionsPage = () => {
  return (
    <>
      <RotateScreen />
      <Header /> <Carousel slides={directionsData} />
    </>
  );
};

export default DirectionsPage;
