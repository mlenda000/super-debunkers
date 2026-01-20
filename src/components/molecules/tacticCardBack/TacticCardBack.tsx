import "./styles/tactic-card-back.css";

interface TacticCardBackProps {
  imageBack: string;
  description: string;
  example: string;
}

const TacticCardBack = ({
  imageBack,
  description,
  example,
}: TacticCardBackProps) => {
  return (
    <div
      className="tactic-card-back tactic-card-face"
      style={{ backgroundImage: `url(${imageBack})` }}
    >
      <div className="tactic-card-back-content">
        <p className="tactic-card-back-description">{description}</p>
        <p className="tactic-card-back-example">{example}</p>
      </div>
    </div>
  );
};

export default TacticCardBack;
