import "./styles/test.css";
import type { ThemeStyle } from "@/types/gameTypes";
import Tool from "@/components/molecules/tool/Tool";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import NextButton from "@/components/atoms/button/Button";
import ButtonStyle from "@/components/atoms/buttonStyle/ButtonStyle";
import BottomNav from "@/components/molecules/bottomNav/BottomNav";
import RoomTab from "@/components/atoms/roomTab/RoomTab";

const mockInfluencer = {
  caption: "this is a mock caption",
  bodyCopy: "this is a mock body copy",
  tacticUsed: [
    // "emotional-manipulation",
    // "conspiracy-theory",
    // "gaslighting",
    // "impersonation",
    // "cherry-picking",
    // "tricky-jokes",
    // "fear-mongering",
    // "deepfakes",
    // "sock-puppetry",
    // "clickbait",
    "true",
  ],
  villain: "all" as ThemeStyle,
  newsImage: "scientist.webp",
};

const TestPage = () => {
  return (
    <div
      style={{
        padding: "20px",
        gap: "8px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* <ScoreModal
        setIsEndGame={function (value: boolean): void {
          throw new Error("Function not implemented.");
        }}
      /> */}
      {/* <EndGameModal
        setIsEndGame={function (value: boolean): void {
          throw new Error("Function not implemented.");
        }}
      /> */}
      {/* <Tool currentInfluencer={mockInfluencer} showResults /> */}
      <ButtonStyle theme="all">
        <NextButton onClick={() => console.log("Next button clicked")} />
      </ButtonStyle>
      <ButtonStyle theme="The_Biost">
        <NextButton onClick={() => console.log("Next button clicked")} />
      </ButtonStyle>
      <ButtonStyle theme="The_Bots">
        <NextButton onClick={() => console.log("Next button clicked")} />
      </ButtonStyle>
      <ButtonStyle theme="The_Oligs">
        <NextButton onClick={() => console.log("Next button clicked")} />
      </ButtonStyle>
      <ButtonStyle theme="The_Celebs">
        <NextButton onClick={() => console.log("Next button clicked")} />
      </ButtonStyle>

      <BottomNav />

      <ButtonStyle theme="The_Biost">
        <RoomTab
          room={"Mark"}
          avatar={"avatar1.webp"}
          onClick={function (
            playerName: string,
            room: string,
            avatar: string,
          ): void {
            throw new Error("Function not implemented.");
          }}
        />
      </ButtonStyle>
    </div>
  );
};

export default TestPage;
