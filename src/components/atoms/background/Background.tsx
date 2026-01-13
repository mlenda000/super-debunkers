import React from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";

const Background = () => {
  const { themeStyle } = useGlobalContext();

  const getBackgroundImage = () => {
    const imageMap: Record<string, string> = {
      all: "/images/backgrounds/all.webp",
      oligs: "/images/backgrounds/olig.webp",
      bots: "/images/backgrounds/bots.webp",
      celebs: "/images/backgrounds/celeb.webp",
      biosts: "/images/backgrounds/biost.webp",
    };
    return imageMap[themeStyle] || imageMap.all;
  };

  return (
    <React.Fragment>
      <div
        className="background"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      />
    </React.Fragment>
  );
};

export default Background;
