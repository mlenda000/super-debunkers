import { useState, useEffect } from "react";
import type { NewsCardProps } from "@/types/gameTypes";

const NewsCard = ({
  name,
  description,
  category: _category,
  image,
  tacticUsed,
  display,
  inTool = false,
}: NewsCardProps) => {
  //ratio 2.5 : 3.5
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageSrc = image
    ? image.startsWith("/")
      ? image
      : "/images/news/" + image
    : "";

  useEffect(() => {
    if (!imageSrc) {
      setImageLoaded(true);
      return;
    }
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true);
    img.src = imageSrc;
  }, [imageSrc]);

  const getClassName = () => {
    if (inTool) return "news-card__in-tool";
    if (display === "modal") return "news-card__modal";
    return "news-card";
  };

  return (
    <div
      className={`${getClassName()} ${imageLoaded ? "news-card--loaded" : "news-card--loading"}`}
      role="article"
      aria-label={`News card: ${name}`}
    >
      <div className="news-card__content">
        {image && (
          <img
            src={imageSrc}
            alt={`News illustration for ${name}`}
            className="news-card__images"
          />
        )}
        <div className="news-card__text">
          <h1 className="news-card__title">{name}</h1>

          {description && (
            <p className="news-card__description">{description}</p>
          )}
        </div>
        {tacticUsed && tacticUsed.length > 0 && (
          <div
            className="news-card__tactic-count"
            role="img"
            aria-label={`${tacticUsed.length} tactic${tacticUsed.length !== 1 ? "s" : ""} used`}
          >
            {(tacticUsed || []).map((tactic) => (
              <img
                src={"/images/news/tactic-indicator.webp"}
                alt=""
                className="news-card__tactic-img"
                key={tactic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;
