import RoomTab from "@/components/atoms/roomTab/RoomTab";
import "./styles/test.css";
// import type { ThemeStyle } from "@/types/gameTypes";
// import Tool from "@/components/molecules/tool/Tool";
import ButtonStyle from "@/components/atoms/buttonStyle/ButtonStyle";
import Footer from "@/components/atoms/footer/Footer";
// import ScoreModal from "@/components/organisms/modals/scoreModal/ScoreModal";
// import EndGameModal from "@/components/organisms/modals/endGameModal/EndGameModal";
// import PlayedCard from "@/components/molecules/playedCard/PlayedCard";
import NewsCard from "@/components/molecules/newsCard/NewsCard";

// const mockInfluencer = {
//   caption: "this is a mock caption",
//   bodyCopy: "this is a mock body copy",
//   tacticUsed: [
//     // "emotional-manipulation",
//     // "conspiracy-theory",
//     // "gaslighting",
//     // "impersonation",
//     // "cherry-picking",
//     // "tricky-jokes",
//     // "fear-mongering",
//     // "deepfakes",
//     // "sock-puppetry",
//     // "clickbait",
//     "true",
//   ],
//   villain: "all" as ThemeStyle,
//   newsImage: "scientist.webp",
// };

const bodyCopy =
  "This amazing vitamin makes you super smart! Tons of kids in the comments say it changed their lives, check them out! \n\nComments: \n\nFunkybird112: I love these vitamins, I am so smart now.\nFunkycat112: These vitamins made me smart.\nFunkyphish112: I am smarter with these vitamins.\nFunkydog112: These are the best vitamins for making you smart.";

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
      {/* <ButtonStyle type="glass" theme="all">
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
      </ButtonStyle> */}
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
        name={"New vitamin makes you super smart — everyone loves it! 🧠💊"}
        description={bodyCopy}
        category={["sock-puppetry"]}
        villain={"bots"}
        image={"bots_vitamin.webp"}
      />
      <p className="test-text">Next next</p>
      <Footer />
    </div>
  );
};

export default TestPage;
