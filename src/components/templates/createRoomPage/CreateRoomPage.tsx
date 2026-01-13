import Header from "@/components/molecules/header/Header";
import CreateRoom from "@/components/organisms/createRoom/CreateRoom";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";

const CreateRoomPage = ({
  rooms,
  setRooms,
}: {
  rooms: string[];
  setRooms: (rooms: string[]) => void;
}) => {
  return (
    <>
      <RotateScreen />
      <Header />
      <CreateRoom rooms={rooms} setRooms={setRooms} />
    </>
  );
};

export default CreateRoomPage;
