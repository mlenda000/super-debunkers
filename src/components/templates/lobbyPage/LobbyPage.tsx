import Header from "@/components/molecules/header/Header";
import RotateScreen from "@/components/atoms/rotateScreen/RotateScreen";
import Lobby from "@/components/organisms/lobby/Lobby";

const LobbyPage = ({ rooms }: { rooms: string[] }) => {
  return (
    <>
      <Header />
      <RotateScreen />
      <Lobby rooms={rooms} />
    </>
  );
};

export default LobbyPage;
