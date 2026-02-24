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
          "Kids with outdated phones are facing social isolation and depression at school! Parents must act NOW! 😢📱"
        }
        description={
          "New studies show children with outdated technology experience devastating bullying and mental health! Don't let your child suffer social rejection—they need the latest iPhone to feel valued and included!"
        }
        category={["fear-mongering"]}
        villain={"all"}
        image={"celeb_influencers.webp"}
      />
    </div>
  );
};

export default TestPage;
