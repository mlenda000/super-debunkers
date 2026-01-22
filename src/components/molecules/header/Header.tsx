import { useNavigate } from "react-router-dom";

interface HeaderProps {
  showPlayButton?: boolean;
}

const Header = ({ showPlayButton = false }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
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
        <button className="header-button header-button-play" onClick={handlePlayGame}>
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
