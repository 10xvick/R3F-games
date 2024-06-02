import { useState } from "react";
import "./App.css";
import { Doodlejump } from "./games/doodlejump/game";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const games = [Doodlejump, GameContainer];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
    </Routes>
  );
}

function Home() {
  return (
    <>
      HOM
      <Link to={"/games"}>games</Link>
      <Routes>
        <Route path="games" element={<Games />}></Route>
      </Routes>
    </>
  );
}

function Games() {
  return <div>games</div>;
}

function GameContainer() {
  const [data, setdata] = useState({ score: 0 });
  return (
    <div className="canvas-container">
      <div className="pos-absolute"> score : {data.score} </div>
      {/* <Doodlejump /> */}
      fwjeoj
    </div>
  );
}

export default App;
