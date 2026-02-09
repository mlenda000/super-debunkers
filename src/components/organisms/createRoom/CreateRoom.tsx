import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "@/components/atoms/input/Input";
import Button from "@/components/atoms/button/Button";
import { PARTYKIT_URL } from "@/services/env";
import { getWebSocketInstance } from "@/services/webSocketService";
import { sendCreateRoom } from "@/utils/gameMessageUtils";

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

  const handleSubmit = async () => {
    if (currentInput === "") {
      alert("Please enter a room name");
      return;
    }

    // Check if room name already exists locally
    if (rooms.includes(currentInput)) {
      alert("A room with that name already exists");
      return;
    }

    try {
      // Send room creation to server via HTTP POST
      const response = await fetch(`${PARTYKIT_URL}/parties/main/lobby`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomName: currentInput }),
      });

      if (response.ok) {
        // Also send via WebSocket to notify other connected clients
        const socket = getWebSocketInstance();
        sendCreateRoom(socket, currentInput);

        // Update local state
        setRooms([...rooms, currentInput]);
        navigate(`/game/lobby`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      // Fallback: create room locally and notify via WebSocket
      const socket = getWebSocketInstance();
      sendCreateRoom(socket, currentInput);
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
