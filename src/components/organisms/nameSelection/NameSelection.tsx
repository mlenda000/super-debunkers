import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/hooks/useGlobalContext";

import Input from "@/components/atoms/input/Input";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import NextButton from "@/components/atoms/button/Button";
import { isProfane } from "@/services/profanityFilter";
import Footer from "@/components/atoms/footer/Footer";

const NameSelection = () => {
  const navigate = useNavigate();
  const { avatar, playerName, setPlayerName } = useGlobalContext();

  const onValidName = (value: string) => {
    localStorage.setItem("playerName", value);
    navigate("/game/lobby");
  };

  const handleSubmit = () => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      alert("Please enter a name");
      return;
    }

    if (isProfane(trimmedName)) {
      alert("Please enter a different name that does not contain profanity.");
      return;
    }

    onValidName(trimmedName);
  };
  return (
    <div
      className="name-selection"
      role="region"
      aria-labelledby="name-selection-heading"
    >
      <div className="name-selection__content">
        {avatar && (
          <div className="name-selection__avatar" style={{ zIndex: 2 }}>
            <AvatarImage src={avatar} display="chosen-avatar" />
          </div>
        )}
        <div className="name-selection__form">
          <form
            className="name-selection__input"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ zIndex: 2 }}
            aria-label="Name entry form"
          >
            <label id="name-selection-heading" className="visually-hidden">
              Enter your player name
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              id="player-name"
              name="playerName"
              aria-label="Enter your player name"
              required
              autoComplete="nickname"
            />
          </form>
          <div className="name-selection-next-button">
            <NextButton
              onClick={handleSubmit}
              disabled={!playerName}
              className="next-button"
              aria-label={
                playerName ? "Continue to lobby" : "Enter a name to continue"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default NameSelection;
