import "./styles/button-style.css";

// Theme color definitions
const THEME_COLORS = {
  all: "#0a0a0a",
  The_Biost: "#56B867",
  The_Bots: "#4345AF",
  The_Oligs: "#E1DFB0",
  The_Celebs: "#D656BB",
} as const;

type ThemeName = keyof typeof THEME_COLORS;

// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

interface ButtonStyleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  theme?: ThemeName;
  className?: string;
}

const ButtonStyle = ({
  children,
  theme = "all",
  className = "",
  ...props
}: ButtonStyleProps) => {
  const baseColor = THEME_COLORS[theme];

  const rgb = hexToRgb(baseColor);
  const rgbString = rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "255, 24, 99";

  const edgeStyle = {
    background: `linear-gradient(
      to left,
      rgba(${rgbString}, 0.3) 0%,
      rgba(${rgbString}, 0.2) 8%,
      rgba(${rgbString}, 0.2) 92%,
      rgba(${rgbString}, 0.3) 100%
    )`,
  };

  const frontStyle = {
    backgroundImage: `
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.6) 0%,
        rgba(255, 255, 255, 0.3) 15%,
        rgba(255, 255, 255, 0.1) 30%,
        transparent 50%,
        rgba(0, 0, 0, 0.05) 100%
      ),
      linear-gradient(
        180deg,
        rgba(${rgbString}, 0.5) 0%,
        rgba(${rgbString}, 0.35) 40%,
        rgba(${rgbString}, 0.25) 60%,
        rgba(${rgbString}, 0.4) 100%
      )`,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    boxShadow: `
      inset 0 1px 1px rgba(255, 255, 255, 0.4),
      inset 0 -1px 1px rgba(0, 0, 0, 0.1),
      0 2px 8px rgba(${rgbString}, 0.2)
    `,
  };

  return (
    <div className={`arcade-effect ${className}`} {...props}>
      <span className="arcade-effect-shadow" />
      <span className="arcade-effect-edge" style={edgeStyle} />
      <span className="arcade-effect-front" style={frontStyle}>
        {children}
      </span>
    </div>
  );
};

export default ButtonStyle;
