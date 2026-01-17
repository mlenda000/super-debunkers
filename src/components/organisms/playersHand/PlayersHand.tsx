import type { PlayersHandProps } from "@/types/gameTypes";

const PlayersHand: React.FC<PlayersHandProps> = ({ items }) => {
  console.log("PlayersHand items:", items);
  return <div>Players Hand Component</div>;
};

export default PlayersHand;
