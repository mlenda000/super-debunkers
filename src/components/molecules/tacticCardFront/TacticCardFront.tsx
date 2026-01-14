import type { TacticCardFrontProps } from "@/types/types";

const TacticCardFront = ({
  image,
  alt,
  className,
  category,
}: TacticCardFrontProps) => {
  return (
    <picture className={className} key={category}>
      <img src={image} alt={alt} className="tactic-card-image" />
    </picture>
  );
};

export default TacticCardFront;
