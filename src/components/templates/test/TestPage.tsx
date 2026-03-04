import RoomTab from "@/components/atoms/roomTab/RoomTab";
import "./styles/test.css";
// import type { ThemeStyle } from "@/types/gameTypes";
import Tool from "@/components/molecules/tool/Tool";
import ButtonStyle from "@/components/atoms/buttonStyle/ButtonStyle";
// import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
// import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
// import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
// import NewsCard from "@/components/molecules/newsCard/NewsCard";

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
      {/* type?: "default" | "glass" | "glowing" | "outline" | "hover"; */}
      <ButtonStyle type="glass" theme="all">
        <RoomTab
          room={"Create Room"}
          avatar={""}
          onClick={function (
            playerName: string,
            room: string,
            avatar: string,
          ): void {
            throw new Error("Function not implemented.");
          }}
        />
      </ButtonStyle>
      {/* <Tool currentInfluencer={mockInfluencer} showResults /> */}
      {/* <PlayedCard
        name={"test"}
        image={"/images/tactics/cherry-picking.webp"}
        id={"test"}
        onUndo={function (id: string | number): void {
          throw new Error("Function not implemented.");
        }}
      /> */}
      {/* <NewsCard
        name={
          "Kids with outdated phones are facing social isolation and depression at school! Parents must act NOW! 😢📱"
        }
        description={
          "New studies show children with outdated technology experience devastating bullying and mental health! Don't let your child suffer social rejection—they need the latest iPhone to feel valued and included!"
        }
        category={["fear-mongering"]}
        villain={"all"}
        image={"celeb_influencers.webp"}
      /> */}
      <p className="test-text">Next next</p>
    </div>
  );
};

export default TestPage;
