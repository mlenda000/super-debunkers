import React from "react";
import { useGlobalContext } from "@/hooks/useGlobalContext";

const Background = () => {
  const { themeStyle } = useGlobalContext();

  const getBackgroundImage = () => {
    const imageMap: Record<string, string> = {
      all: "/images/backgrounds/all.webp",
      The_Olig: "/images/backgrounds/olig.webp",
      The_Bots: "/images/backgrounds/bots.webp",
      The_Celeb: "/images/backgrounds/celeb.webp",
      The_Biost: "/images/backgrounds/biost.webp",
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
