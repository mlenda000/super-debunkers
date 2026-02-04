import "./styles/test.css";
import type { ThemeStyle } from "@/types/types";
import Tool from "@/components/molecules/tool/Tool";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";

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
    <div>
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
      <Tool currentInfluencer={mockInfluencer} showResults />
    </div>
  );
};

export default TestPage;
