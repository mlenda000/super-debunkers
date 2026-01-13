import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/hooks/useGlobalContext";

import Input from "@/components/atoms/input/Input";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import NextButton from "@/components/atoms/button/Button";

const NameSelection = () => {
  const navigate = useNavigate();
  const { avatar, playerName, setPlayerName } = useGlobalContext();

  const handleNameChange = (value: string) => {
    setPlayerName(value);
    // Sync to localStorage
    localStorage.setItem("playerName", value);
  };

  const handleSubmit = () => {
    if (playerName === "") {
      alert("Please enter a name");
      return;
    } else {
      navigate("/game/lobby");
    }
  };
  return (
    <>
      <div className="name-selection">
        <div className="name-selection__content">
          <form
            className="name-selection__input"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ zIndex: 2 }}
          >
            {avatar && (
              <div className="name-selection__avatar" style={{ zIndex: 2 }}>
                <AvatarImage src={avatar} display="chosen-avatar" />
              </div>
            )}
            <Input
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your name"
            />
          </form>
          <NextButton
            onClick={handleSubmit}
            disabled={!playerName}
            className="next-button"
          />
        </div>
      </div>
    </>
  );
};
export default NameSelection;
