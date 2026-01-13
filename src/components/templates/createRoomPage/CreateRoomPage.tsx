import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/atoms/input/Input";

const CreateRoomPage = ({
  rooms,
  setRooms,
}: {
  rooms: string[];
  setRooms: (rooms: string[]) => void;
}) => {
  const navigate = useNavigate();

  const [currentInput, setCurrentInput] = useState<string>("");
  const handleInput = (value: string) => {
    setCurrentInput(value);
  };

  const handleSubmit = () => {
    if (currentInput === "") {
      alert("Please enter a room name");
      return;
    } else {
      setRooms([...rooms, currentInput]);
      navigate(`/game/lobby`);
    }
  };

  return (
    <>
      <div className="create-room__container">
        <img
          src={"/images/new-game.png"}
          alt="Logo"
          style={{ width: "35%", height: "auto" }}
          className="create-room__title"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="create-room__input">
            <Input
              value={currentInput}
              placeholder="Room name"
              onChange={(e) => handleInput(e.target.value)}
            />
          </div>
        </form>
        <button onClick={handleSubmit} className="next-button">
          <img
            src={`/images/${
              currentInput ? "pink-next-button.png" : "gray-next-button.png"
            }`}
            alt="Logo"
            style={{ cursor: "pointer", width: "50%", height: "auto" }}
          />
        </button>
      </div>
    </>
  );
};
export default CreateRoomPage;
