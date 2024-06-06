import "./App.css";
import { Doodlejump } from "./games/doodlejump/components/game/game";
import { Link, Outlet, Route, Routes } from "react-router-dom";
import React from "react";
import ThreejsStarter from "./games/threejs-starter/threejsStarter";

const games = [Doodlejump, ThreejsStarter];

function App() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />}></Route>
        <Route path="games">
          <Route index element={<Games />} />
          <Route path="" element={<GameContainer />}>
            {games.map((Component) => (
              <Route
                key={Component.name}
                path={Component.name}
                element={<Component />}
              />
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
    <>
      <div className="pos-absolute"> # </div>
      <Outlet />
    </>
  );
}

export default App;
