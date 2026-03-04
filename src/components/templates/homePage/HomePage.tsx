import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import BottomNav from "@/components/molecules/bottomNav/BottomNav";
import { useState, useEffect, useRef } from "react";

const HomePage = () => {
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
          <BottomNav />
        </div>
      </div>
    </>
  );
};

export default HomePage;
