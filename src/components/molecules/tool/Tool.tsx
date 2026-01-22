import { useState, useEffect } from "react";
import NewsCard from "../newsCard/NewsCard";

interface ToolProps {
  showResults: boolean;
  currentInfluencer?: {
    caption?: string;
    bodyCopy?: string;
    tacticUsed?: string[];
    villain?: string;
    newsImage?: string;
  } | null;
}

// Mock data for testing/styling - using realistic content from influencerCards.json
const mockInfluencer = {
  caption: "🚨 ALERT: Your school water fountain is FILLED with deadly chemicals! ☠️🚰",
  bodyCopy: "Scientists just discovered that school water fountains contain a dangerous chemical also found in nuclear waste! Some schools have even been caught hiding the truth because they don't want to spend money fixing the pipes. Experts say drinking this water could cause permanent brain damage—but no one is warning students!",
  tacticUsed: ["Fabrication", "Fear-mongering"],
  villain: "The_Biost",
  newsImage: "biost_water-fountain.webp",
};

const Tool = ({ showResults, currentInfluencer: propInfluencer }: ToolProps) => {
  const currentInfluencer = propInfluencer ?? mockInfluencer;

  return (
    <div className="tool__container">
      <div className="tool-image">
        <img
          src={`/images/tool/tool-wrapper.webp`}
          alt="tool"
          style={{
            display: "grid",
            placeItems: "center",
            position: "relative",
            width: "100%",
            height: "auto",
            zIndex: 5,
          }}
        />
      </div>
      <div className="tool-newscard">
        <div className="sliding-background">
          <NewsCard
            name={currentInfluencer?.caption}
            description={currentInfluencer?.bodyCopy}
            example="Influencer Example"
            category={currentInfluencer?.tacticUsed}
            villain={currentInfluencer?.villain}
            image={
              currentInfluencer?.newsImage
                ? `/images/news/${currentInfluencer.newsImage}`
                : `/images/news/scientist.webp`
            }
            display="modal"
          />
        </div>
      </div>

      <img
        src={`/images/tool/tool-swiper.webp`}
        className="tool-swiper"
        style={{}}
        alt="tool swiper"
      />

      <div className="tool-result">
        {!showResults ? (
          <img
            src={"/images/tool/answers/reading.webp"}
            alt="reading"
            style={{
              width: "100%",
              animation: "fadeInOut 0.8s infinite alternate",
              top: "160px",
            }}
          />
        ) : currentInfluencer?.tacticUsed[0] === "True" ? (
          <img
            src={"/images/tool/answers/facts.webp"}
            alt="reading"
            style={{
              width: "100%",
              animation: "fadeIn .5s ",
            }}
          />
        ) : (
          <ImageCarousel images={currentInfluencer?.tacticUsed} />
        )}
      </div>
      <style>
        {`
                    @keyframes fadeInOut {
                        from {
                            opacity: 1;
                        }
                        to {
                            opacity: 0;
                        }
                    }

                    @keyframes slideBackground {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(705px);
                        }
                    }

                   
                `}
      </style>
    </div>
  );
};

export const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detected, setDetected] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDetected(false);
    }, 2000);

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 3 second
    return () => clearInterval(interval);
  }, [images]);
  return (
    <>
      {detected ? (
        <img
          src={"/images/tool/answers/Fake-detected.webp"}
          alt="reading"
          style={{
            width: "100%",
            top: "260px",
          }}
        />
      ) : (
        <img
          src={
            "/images/tool/answers/" +
            images[currentIndex].toLowerCase() +
            ".webp"
          }
          alt={images[currentIndex]}
          style={{
            width: "100%",
          }}
        />
      )}
    </>
  );
};

export default Tool;
