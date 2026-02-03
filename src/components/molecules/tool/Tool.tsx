import { useState, useEffect, useCallback } from "react";
import type { ThemeStyle } from "@/types/types";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

interface ToolProps {
  showResults: boolean;
  currentInfluencer?: {
    caption?: string;
    bodyCopy?: string;
    tacticUsed?: string[];
    villain?: ThemeStyle;
    newsImage?: string;
  } | null;
}

// Mock data for testing/styling
const mockInfluencer = {
  caption:
    "🚨 ALERT: Your school water fountain is FILLED with deadly chemicals! ☠️🚰",
  bodyCopy:
    "Scientists just discovered that school water fountains contain a dangerous chemical also found in nuclear waste! Some schools have even been caught hiding the truth because they don't want to spend money fixing the pipes. Experts say drinking this water could cause permanent brain damage—but no one is warning students!",
  tacticUsed: ["Fabrication", "Fear-mongering"],
  villain: "The_Biost",
  newsImage: "scientist.webp",
};

// Preload images and return a promise that resolves when all are loaded
const preloadImages = (imageSrcs: string[]): Promise<void[]> => {
  return Promise.all(
    imageSrcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to prevent blocking
          img.src = src;
        }),
    ),
  );
};

const TestTool = ({
  showResults,
  currentInfluencer: propInfluencer,
}: ToolProps) => {
  const currentInfluencer = propInfluencer ?? mockInfluencer;
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [animationsStarted, setAnimationsStarted] = useState(false);

  // Collect all image sources to preload
  const getImagesToPreload = useCallback(() => {
    const images = [
      "/images/tool/tool-wrapper.webp",
      "/images/tool/tool-swiper.webp",
      "/images/tool/answers/reading.webp",
      "/images/tool/answers/facts.webp",
      "/images/tool/answers/Fake-detected.webp",
      currentInfluencer?.newsImage
        ? `/images/news/${currentInfluencer.newsImage}`
        : "/images/news/scientist.webp",
    ];

    // Add tactic images if available
    if (currentInfluencer?.tacticUsed) {
      currentInfluencer.tacticUsed.forEach((tactic) => {
        if (tactic !== "true") {
          images.push(`/images/tool/answers/${tactic.toLowerCase()}.webp`);
        }
      });
    }

    return images;
  }, [currentInfluencer]);

  useEffect(() => {
    const loadAssets = async () => {
      await preloadImages(getImagesToPreload());
      setAssetsLoaded(true);
      // Small delay to ensure DOM is painted before starting animations
      requestAnimationFrame(() => {
        setAnimationsStarted(true);
      });
    };

    loadAssets();
  }, [getImagesToPreload]);

  return (
    <div
      className={`tool ${assetsLoaded ? "tool--loaded" : "tool--loading"} ${animationsStarted ? "tool--animate" : ""}`}
    >
      {/* Layer 1 (Bottom): NewsCard - sits inside the tool window */}
      <div className="tool__layer tool__layer--newscard">
        <div className="tool__newscard-wrapper">
          <div className="tool__sliding-background">
            <NewsCard
              name={currentInfluencer?.caption ?? ""}
              description={currentInfluencer?.bodyCopy ?? ""}
              example="Influencer Example"
              category={currentInfluencer?.tacticUsed ?? []}
              villain={currentInfluencer?.villain as ThemeStyle}
              image={
                currentInfluencer?.newsImage
                  ? `/images/news/${currentInfluencer.newsImage}`
                  : `/images/news/scientist.webp`
              }
              display="modal"
              inTool={true}
            />
          </div>
        </div>
      </div>

      {/* Layer 2: Tool window/background area (transparent window region) */}
      <div className="tool__layer tool__layer--window">
        {/* Swiper animation element */}
        <img
          src="/images/tool/tool-swiper.webp"
          className="tool__swiper"
          alt="tool swiper"
        />
      </div>

      {/* Layer 3: Tool-wrapper frame image */}
      <div className="tool__layer tool__layer--frame">
        <img
          src="/images/tool/tool-wrapper.webp"
          alt="tool frame"
          className="tool__frame-image"
        />
      </div>

      {/* Layer 4 (Top): Results - Image carousel / reading / facts */}
      <div className="tool__layer tool__layer--results">
        <div className="tool__results-content">
          {!showResults ? (
            <img
              src="/images/tool/answers/reading.webp"
              alt="reading"
              className="tool__result-image tool__result-image--reading"
            />
          ) : currentInfluencer?.tacticUsed &&
            currentInfluencer.tacticUsed[0] === "true" ? (
            <img
              src="/images/tool/answers/facts.webp"
              alt="facts"
              className="tool__result-image tool__result-image--facts"
            />
          ) : (
            <TestImageCarousel images={currentInfluencer?.tacticUsed ?? []} />
          )}
        </div>
      </div>
    </div>
  );
};

// Image carousel component for cycling through tactic images
const TestImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detected, setDetected] = useState(true);

  useEffect(() => {
    const detectedTimeout = setTimeout(() => {
      setDetected(false);
    }, 2000);

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => {
      clearTimeout(detectedTimeout);
      clearInterval(interval);
    };
  }, [images]);

  return (
    <>
      {detected ? (
        <img
          src="/images/tool/answers/Fake-detected.webp"
          alt="fake detected"
          className="tool__result-image tool__result-image--detected"
        />
      ) : (
        <img
          src={`/images/tool/answers/${images[currentIndex].toLowerCase()}.webp`}
          alt={images[currentIndex]}
          className="tool__result-image tool__result-image--tactic"
        />
      )}
    </>
  );
};

export default TestTool;
