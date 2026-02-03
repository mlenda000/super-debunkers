import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  showPlayButton?: boolean;
}

const Header = ({ showPlayButton = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Smart back navigation based on current route
    const path = location.pathname;

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

  const handlePlayGame = () => {
    navigate("/character-creation");
  };

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
