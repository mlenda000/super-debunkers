import type { TacticCardFrontProps } from "@/types/types";
import "./styles/tactic-card-front.css";

const TacticCardFront = ({
  image,
  alt,
  className,
  category,
}: TacticCardFrontProps) => {
  return (
    <div
      className={`tactic-card-front tactic-card-face ${className ?? ""}`}
      key={category}
    >
      <img src={image} alt={alt} className="tactic-card-image" />
    </div>
  );
};

export default TacticCardFront;
