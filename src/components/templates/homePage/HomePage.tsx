import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
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
      } else {
        setHasScrolled(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <RotateScreen />
      <div className="homepage" ref={homepageRef}>
        <h1 className="home-title">Super Debunkers</h1>
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
          This is Base Camp, where you'll learn to spot lies and expose fake
          news on your journey to becoming a Super Debunker. Stay focused, check
          the facts and uncover what's real and what's fake!
        </p>
        <img
          src="/images/home/newscard.webp"
          alt="News card"
          className="home-secondary-image"
        />
        <h2 className="home-secondary-header">Here's your mission.</h2>
        <p className="home-description home-description-secondary">
          The more fake news you debunk, the more followers you gain, bringing
          you one step closer to becoming a Super Debunker!
        </p>
        <div
          className="home-button-group"
          role="navigation"
          aria-label="Main menu"
        >
          <button
            className="home-button"
            onClick={() => navigate("/character-creation")}
            aria-label="Start playing Super Debunkers"
          >
            <h3 className="home-button-title">Super Debunkers</h3>
            <span className="home-play-button">
              <p className="home-button-description">Play Game</p>
              <img
                src="/images/buttons/next.webp"
                alt=""
                width="48px"
                height="48px"
                aria-hidden="true"
              />
            </span>
          </button>
          <button
            className="home-button"
            onClick={() => navigate("/villains")}
            aria-label="Meet the villains"
          >
            <img
              src="/images/home/villain.webp"
              alt=""
              className="home-button-image"
              aria-hidden="true"
            />
            <p className="home-play-button home-button-description">
              Meet the villains
            </p>
          </button>
          <button
            className="home-button"
            onClick={() => navigate("/directions")}
            aria-label="View game instructions"
          >
            <img
              src="/images/home/directions.webp"
              alt=""
              className="home-button-image"
              aria-hidden="true"
            />
            <p className="home-play-button home-button-description">
              Instructions
            </p>
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
