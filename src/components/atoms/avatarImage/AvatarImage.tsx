import { useMemo } from "react";
import type { AvatarImageProps } from "@/types/types";

const AvatarImage = ({
  src,
  alt,
  avatar,
  setAvatar,
  display,
  playerSelection,
  playerReady = false,
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
      className={
        display
          ? `avatar-image-container__${display}`
          : "avatar-image-container"
      }
      style={
        avatarName === srcName
          ? {
              scale: 1.2,
              border: "3px solid rgb(226, 31, 73)",
              boxShadow: "0 0 10px rgb(226, 31, 73)",
              zIndex: 2,
            }
          : { zIndex: 2 }
      }
      onClick={playerSelection ? handleSelect : undefined}
      onKeyDown={playerSelection ? handleKeyDown : undefined}
      role={playerSelection ? "button" : undefined}
      tabIndex={playerSelection ? 0 : undefined}
      aria-label={playerSelection ? `Select avatar ${alt || src}` : undefined}
    >
      {playerReady ? (
        <img
          src={src && src.includes("/") ? src : `/images/buttons/ready.webp`}
          alt="player is ready"
        />
      ) : (
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
      )}
    </div>
  );
};
export default AvatarImage;
