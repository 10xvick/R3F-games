import "./App.css";
import { Doodlejump } from "./games/doodlejump/game";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import React from "react";

const games = [Doodlejump];

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />}></Route>
        <Route path="games">
          <Route index element={<Games />} />
          <Route path="" element={<GameContainer />}>
            {games.map((Game) => (
              <Route path={Game.name} element={<Game />} />
            ))}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

function Home() {
  return (
    <>
      HOME
      <div>
        <Link to={"/games"}>games</Link>
      </div>
    </>
  );
}

function Games() {
  return (
    <div>
      <div>games</div>
      <ol>
        {games.map((game) => (
          <li>
            <Link key={game.name} to={game.name}>
              {game.name}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function GameContainer() {
  return (
    <div className="canvas-container">
      <div className="pos-absolute"> # </div>
      <Outlet />
    </div>
  );
}

export default App;
