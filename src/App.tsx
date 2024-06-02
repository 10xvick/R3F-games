import { useState } from "react";
import "./App.css";
import { Doodlejump } from "./games/doodlejump/game";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const games = [Doodlejump, GameContainer];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/games" element={<Games />}></Route>
      </Route>
    </Routes>
  );
}

function Home() {
  return (
    <>
      HOMe
      <Link to={"/games"}>games</Link>
    </>
  );
}

function Games() {
  return <div>home</div>;
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
