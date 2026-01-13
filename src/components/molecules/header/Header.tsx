import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
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
    </header>
  );
};

export default Header;
