import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const [hasScrolled, setHasScrolled] = useState(false);
  const homepageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = homepageRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 10) {
        setHasScrolled(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="homepage" ref={homepageRef}>
      <h1>Super Debunkers</h1>
      {!hasScrolled && (
        <img
          src="/images/buttons/down.webp"
          alt="Scroll down"
          className="scroll-indicator"
        />
      )}
      <img
        src="/images/home/allvillains.webp"
        alt="All villains"
        className="home-hero-image"
      />
      <h2>Welcome Debunkers</h2>
      <p className="home-description">
        This is Base Camp, where you'll learn to spot lies and expose fake news
        on your journey to becoming a Super Debunker. <br />
        Stay focused, check the facts and uncover what's real and what's fake!
      </p>
      <img
        src="/images/home/newscard.webp"
        alt="News card"
        className="home-secondary-image"
      />
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
