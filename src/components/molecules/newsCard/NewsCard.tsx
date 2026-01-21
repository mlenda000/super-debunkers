import type { NewsCardProps } from "@/types/gameTypes";

const NewsCard = ({
  name,
  description,
  category,
  image,
  tacticUsed,
  display,
}: NewsCardProps) => {
  //ratio 2.5 : 3.5

  return (
    <div className={display === "modal" ? "news-card__modal" : "news-card"}>
      <div className="news-card__content">
        {image && (
          <img src={image} alt={category[0]} className="news-card__images" />
        )}
        <div className="news-card__text">
          <h1 className="news-card__title">{name}</h1>

          {description && (
            <p className="news-card__description">{description}</p>
          )}
        </div>
        {tacticUsed && tacticUsed.length > 0 && (
          <div className="news-card__tactic-count">
            {(tacticUsed || []).map((tactic) => (
              <img
                src={"/images/news/tactic-indicator.webp"}
                alt="Tactic used count"
                height="20px"
                width="auto"
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
