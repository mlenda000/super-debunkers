import type { NextButtonProps } from "@/types/types";

const NextButton = ({
  onClick,
  disabled = false,
  className = "next-button",
}: NextButtonProps) => {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      <p className="next-button-text">Next</p>
      <img
        src={`/images/buttons/${!disabled ? "next.webp" : "gray-next.png"}`}
        alt="Next"
        className="next-button-image"
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      />
    </button>
  );
};

export default NextButton;
