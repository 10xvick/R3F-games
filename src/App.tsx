import { useState } from "react";
import "./App.css";
import { Doodlejump } from "./games/doodlejump/game";

function App() {
  return (
    <>
      <GameContainer />
    </>
  );
}

function GameContainer() {
  const [data, setdata] = useState({ score: 0 });
  return (
    <div className="canvas-container">
      <div className="pos-absolute"> score : {data.score} </div>
      <Doodlejump />
    </div>
  );
}

export default App;
