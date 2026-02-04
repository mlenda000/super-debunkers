import { useNavigate, useLocation } from "react-router-dom";
import type { HeaderProps } from "@/types/types";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import NextButton from "@/components/atoms/button/Button";

const Header = ({ showPlayButton = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerName, avatar } = useGlobalContext();
  const path = location.pathname;
  const handleBack = () => {
    // Smart back navigation based on current route
    // const path = location.pathname;

    if (path === "/game/lobby" || path.startsWith("/game/")) {
      // From lobby or game, go back to name selection
      navigate("/character-creation/name");
    } else if (path === "/character-creation/name") {
      // From name selection, go to character creation
      navigate("/character-creation");
    } else if (path === "/character-creation") {
      // From character creation, go home
      navigate("/");
    } else {
      // Default: use browser history
      navigate(-1);
    }
  };

  const handleNext = () => {
    if (path === "/character-creation") {
      // From character creation, go to name selection
      navigate("/character-creation/name");
    } else if (path === "/character-creation/name") {
      // From name selection, go to lobby
      navigate("/game/lobby");
    } else {
      // Default: do nothing or navigate to a default page
    }
  };
  // // Smart next navigation based on current route

  const handlePlayGame = () => {
    navigate("/character-creation");
  };

  const isDisabled =
    path === "/character-creation/name"
      ? playerName === ""
      : path === "/character-creation"
        ? avatar === ""
        : false;

  return (
    <header className="app-header">
      <button className="header-button" onClick={handleBack}>
        <img
          src="/images/buttons/back-arrow.webp"
          alt="Back button"
          className="header-button-image"
        />
        Back
      </button>

      {path === "/character-creation" || path === "/character-creation/name" ? (
        <NextButton
          onClick={handleNext}
          className="next-button next-button-header"
          disabled={isDisabled}
        />
      ) : null}
      {showPlayButton && (
        <button
          className="header-button header-button-play"
          onClick={handlePlayGame}
        >
          Play Game
          <img
            src="/images/buttons/play-game.webp"
            alt="Play Game"
            className="header-button-image header-button-image-right"
          />
        </button>
      )}
    </header>
  );
};

export default Header;
