import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Background from "@/components/atoms/background/Background";
import HomePage from "@/components/templates/homePage/HomePage";
import VillainsPage from "@/components/templates/villainsPage/VillainsPage";
import DirectionsPage from "@/components/templates/directionsPage/DirectionsPage";
import GamePage from "@/components/templates/gamePage/GamePage";
import LobbyPage from "@/components/templates/lobbyPage/LobbyPage";
import CharacterCreationPage from "@/components/templates/characterCreationPage/CharacterCreationPage";
import NamePage from "@/components/templates/namePage/NamePage";
import CreateRoomPage from "@/components/templates/createRoomPage/CreateRoomPage";
import TestPage from "./components/templates/test/TestPage";

import "./App.css";

function App() {
  const [rooms, setRooms] = useState<string[]>([
    "Create room",
    "dfg-misinformation",
  ]);
  return (
    <React.Fragment>
      <BrowserRouter>
        <Background />
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/villains" element={<VillainsPage />} />
          <Route path="/directions" element={<DirectionsPage />} />
          <Route
            path="/character-creation"
            element={<CharacterCreationPage />}
          />
          <Route path="/character-creation/name" element={<NamePage />} />
          <Route path="/game/lobby" element={<LobbyPage rooms={rooms} />} />
          <Route
            path="/game/create-room"
            element={<CreateRoomPage rooms={rooms} setRooms={setRooms} />}
          />
          <Route path="/game/:room" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
