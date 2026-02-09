import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Lobby from "@/components/organisms/lobby/Lobby";

interface LobbyPageProps {
  rooms: string[];
  setRooms?: (rooms: string[]) => void;
}

const LobbyPage = ({ rooms, setRooms }: LobbyPageProps) => {
  return (
    <>
      <Header />
      <RotateScreen />
      <Lobby rooms={rooms} setRooms={setRooms} />
    </>
  );
};

export default LobbyPage;
