import "./styles/test.css";
import type { ThemeStyle } from "@/types/gameTypes";
import Tool from "@/components/molecules/tool/Tool";
import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

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
    <div style={{ padding: "20px" }}>
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
      {/* <PlayedCard
        name={"test"}
        image={"/images/tactics/cherry-picking.webp"}
        id={"test"}
        onUndo={function (id: string | number): void {
          throw new Error("Function not implemented.");
        }}
      /> */}
      <NewsCard
        name={
          "URGENT: Your favorite influencers are LEAVING TikTok forever! Don't get left behind! 😨💔"
        }
        description={
          "Top creators are secretly moving to a new exclusive app called \"StarVault\"! If you don't join NOW, you'll lose access to your faves forever! Only 24 hours left to get in!"
        }
        category={["fear-mongering"]}
        villain={"all"}
        image={"celeb_influencers.webp"}
      />
    </div>
  );
};

export default TestPage;
