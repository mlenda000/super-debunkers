import { useNavigate } from "react-router-dom";
import "./styles/home-page.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <h1>Super Debunkers</h1>
      <h2>Welcome Debunkers</h2>
      <p className="home-description">
        This is Base Camp, where you'll learn to spot lies and expose fake news
        on your journey to becoming a Super Debunker. <br />
        Stay focused, check the facts and uncover what's real and what's fake!
      </p>
      <h2 className="home-secondary-header">Here's your mission.</h2>
      <p className="home-description home-description-secondary">
        The more fake news you debunk, the more followers you gain, bringing you
        one step closer to becoming a Super Debunker!
      </p>
      <div className="home-button-group">
        <button
          className="home-button"
          onClick={() => navigate("/character-creation")}
        >
          <h3 className="home-button-title">Super Debunkers</h3>
          <span className="home-play-button">
            <p className="home-button-description">Play Game</p>
            <img
              src="/images/buttons/next.webp"
              alt="Play game"
              width="48px"
              height="48px"
            />
          </span>
        </button>
        <button className="home-button" onClick={() => navigate("/villains")}>
          <img
            src="/images/home/villain.webp"
            alt="Meet the villains"
            className="home-button-image"
          />
          <p className="home-play-button home-button-description">
            Meet the villains
          </p>
        </button>
        <button className="home-button" onClick={() => navigate("/directions")}>
          <img
            src="/images/home/directions.webp"
            alt="Learn how to play"
            className="home-button-image"
          />
          <p className="home-play-button home-button-description">
            Instructions
          </p>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
