import { useNavigate } from "react-router-dom";

const navigationButtons = [
  {
    label: "Play Game",
    imageSrc: "/images/buttons/next.webp",
    altText: "",
    route: "/character-creation",
    ariaLabel: "Start playing Super Debunkers",
  },
  {
    label: "Meet the villains",
    imageSrc: "/images/home/villain.webp",
    altText: "",
    route: "/villains",
    ariaLabel: "Meet the villains",
  },
  {
    label: "Instructions",
    imageSrc: "/images/home/directions.webp",
    altText: "",
    route: "/directions",
    ariaLabel: "View game instructions",
  },
];

const BottomNav = () => {
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav">
      {navigationButtons.map((button) => (
        <button
          key={button.label}
          className="bottom-nav_button"
          onClick={() => navigate(button.route)}
          aria-label={button.ariaLabel}
        >
          <img
            src={button.imageSrc}
            alt={button.altText}
            className="bottom-nav_button-image"
            aria-hidden="true"
          />
          <p className="bottom-nav_button-label">{button.label}</p>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
