import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/atoms/input/Input";
import Button from "@/components/atoms/button/Button";

const CreateRoom = ({
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
      <div
        className="create-room__container"
        role="region"
        aria-labelledby="create-room-title"
      >
        <h1 id="create-room-title" className="create-room__title">
          Create Room
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          aria-label="Create new room form"
        >
          <div className="create-room__input">
            <Input
              value={currentInput}
              placeholder="Room name"
              onChange={(e) => handleInput(e.target.value)}
              id="room-name"
              name="roomName"
              aria-label="Enter room name"
              required
            />
          </div>
        </form>

        <Button
          onClick={handleSubmit}
          aria-label={
            currentInput
              ? "Create room and continue"
              : "Enter a room name to continue"
          }
        >
          Next
        </Button>
      </div>
    </>
  );
};
export default CreateRoom;
