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
      <div className="create-room__container">
        <h1 className="create-room__title">Create Room</h1>
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

        <Button onClick={handleSubmit}>Create Room</Button>
      </div>
    </>
  );
};
export default CreateRoom;
