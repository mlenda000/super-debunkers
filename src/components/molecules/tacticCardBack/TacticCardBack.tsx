import type { TacticCardBackProps } from "@/types/types";

const TacticCardBack = ({
  imageBack,
  description,
  category,
  className,
}: TacticCardBackProps) => {
  return (
    <div className={`tactic-card-back ${className ?? ""}`}>
      <img
        src={imageBack}
        alt=""
        className="tactic-card-image-back"
        aria-hidden="true"
      />
      <p
        className={`tactic-card-back-description ${
          category === "true" ? "truth" : ""
        }`}
      >
        {description}
      </p>
    </div>
  );
};

export default TacticCardBack;
