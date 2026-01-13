import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import AvatarImage from "@/components/atoms/avatarImage/AvatarImage";
import NextButton from "@/components/atoms/button/Button";

const PlayerSelection = () => {
  const navigate = useNavigate();
  const { avatar, setAvatar } = useGlobalContext();

  const avatars = [
    `/images/avatars/avatar1.webp`,
    `/images/avatars/avatar2.webp`,
    `/images/avatars/avatar3.webp`,
    `/images/avatars/avatar4.webp`,
    `/images/avatars/avatar5.webp`,
    `/images/avatars/avatar6.webp`,
  ];

  const handleAvatarSelect = (selectedAvatar: string) => {
    setAvatar(selectedAvatar);
    // Sync to localStorage
    localStorage.setItem("avatarImage", selectedAvatar);
  };

  const handleSubmit = () => {
    if (avatar === "") {
      alert("Please select an avatar");
      return;
    } else {
      navigate("/character-creation/name");
    }
  };

  return (
    <>
      <div className="player-selection">
        <h2 className="player-selection__header">Select your Debunker</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="player-selection__avatar-container">
            {avatars.map((img, index) => (
              <div className="player-selection__avatar" key={index}>
                <AvatarImage
                  src={img}
                  avatar={avatar}
                  setAvatar={handleAvatarSelect}
                  key={`${avatar}-${index}`}
                  playerSelection={true}
                />
              </div>
            ))}
          </div>
        </form>
        <NextButton onClick={handleSubmit} disabled={!avatar} />
      </div>
    </>
  );
};

export default PlayerSelection;
