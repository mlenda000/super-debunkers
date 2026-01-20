import "./styles/tactic-card-back.css";

interface TacticCardBackProps {
  imageBack: string;
  description: string;
  example?: string;
  category?: string;
  className?: string;
}

const TacticCardBack = ({
  imageBack,
  description,
  category,
  className,
}: TacticCardBackProps) => {
  console.log("category in TacticCardBack:", category);
  return (
    <div className={`tactic-card-back ${className ?? ""}`}>
      <img
        src={imageBack}
        alt={description}
        className="tactic-card-image-back"
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
