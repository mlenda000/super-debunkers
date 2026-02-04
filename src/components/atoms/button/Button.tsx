import type { NextButtonProps } from "@/types/types";

const NextButton = ({
  onClick,
  disabled = false,
  className = "next-button",
  children = "Next",
  "aria-label": ariaLabel,
}: NextButtonProps) => {
  const buttonText = typeof children === "string" ? children : "Next";

  return (
    <button
      onClick={onClick}
      className={className}
      disabled={disabled}
      aria-label={ariaLabel || buttonText}
      aria-disabled={disabled}
    >
      <p className="next-button-text" aria-hidden="true">
        {children}
      </p>
      <img
        src={`/images/buttons/${!disabled ? "next.webp" : "gray-next.webp"}`}
        alt=""
        className="next-button-image"
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        aria-hidden="true"
      />
    </button>
  );
};

export default NextButton;
