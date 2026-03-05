import Header from "@/components/molecules/header/Header";
import CreateRoom from "@/components/organisms/createRoom/CreateRoom";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Footer from "@/components/atoms/footer/Footer";

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
      <Footer type="fixed" />
    </>
  );
};

export default CreateRoomPage;
