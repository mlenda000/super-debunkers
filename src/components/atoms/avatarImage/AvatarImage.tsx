import { useMemo } from "react";
import type { AvatarImageProps } from "@/types/types";

const AvatarImage = ({
  src,
  alt,
  avatar,
  setAvatar,
  display,
  playerSelection,
}: AvatarImageProps) => {
  const srcName = useMemo(() => {
    if (!src) return "";
    return src.includes("/") ? src.split("/").pop() || "" : src;
  }, [src]);

  const avatarName = useMemo(() => {
    if (!avatar) return "";
    return avatar.includes("/") ? avatar.split("/").pop() || "" : avatar;
  }, [avatar]);

  const handleSelect = () => {
    if (playerSelection && setAvatar) {
      setAvatar(src && src.includes("/") ? src : `/images/avatars/${src}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (playerSelection && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      className={`${
        display
          ? `avatar-image-container__${display}`
          : "avatar-image-container"
      }${avatarName === srcName ? " avatar-image-container--selected" : ""}`}
      style={
        avatarName === srcName
          ? {
              border: "3px solid white",
              boxShadow: "0 0 10px white",
              zIndex: 2,
            }
          : avatar
            ? { scale: 0.9, zIndex: 1 }
            : { zIndex: 2 }
      }
      onClick={playerSelection ? handleSelect : undefined}
      onKeyDown={playerSelection ? handleKeyDown : undefined}
      role={playerSelection ? "button" : undefined}
      tabIndex={playerSelection ? 0 : undefined}
      aria-label={playerSelection ? `Select avatar ${alt || src}` : undefined}
    >
      <img
        src={src && src.includes("/") ? src : `/images/avatars/${src}`}
        alt={alt}
        style={{
          borderRadius: "50%",
          cursor: playerSelection ? "pointer" : "default",
          zIndex: 2,
        }}
        className="avatar-image"
      />
    </div>
  );
};
export default AvatarImage;
