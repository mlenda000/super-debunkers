import type { NextButtonProps } from "@/types/types";

const NextButton = ({
  onClick,
  disabled = false,
  className = "next-button",
  children = "Next",
}: NextButtonProps) => {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      <p className="next-button-text">{children}</p>
      <img
        src={`/images/buttons/${!disabled ? "next.webp" : "gray-next.webp"}`}
        alt="Next"
        className="next-button-image"
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </button>
  );
};

export default NextButton;
