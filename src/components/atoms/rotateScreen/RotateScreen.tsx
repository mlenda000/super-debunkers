const RotateScreen = () => {
  return (
    <div
      className="rotate-screen-overlay"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="rotate-screen-content">
        <svg
          className="rotate-screen-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="m17 8-5 5-5-5" />
        </svg>
        <p className="rotate-screen-text">
          Please rotate your device to landscape
        </p>
      </div>
    </div>
  );
};

export default RotateScreen;
