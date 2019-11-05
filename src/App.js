import React from "react";
import { Grommet, Button } from "grommet";
import { start, join } from "./bot.js";
function App() {
  const bot = window.location.pathname.split("/")[1];
  const bots = {
    1: {
      id: "ccb01141-1c22-43de-be55-f97fe8263462",
      username: "[Bot]Stook"
    },
    2: {
      id: "cdddd141-1c22-33de-be55-f97fe8263462",
      username: "[Bot]Stook3"
    }
  };
  setTimeout(() => {
    join(bots[bot].id, bots[bot].username);
  });
  setTimeout(() => {
    start();
  }, 500);
  return (
    <Grommet plain>
      <Button
        onClick={() => {
          start();
        }}
        label="Force Start"
      ></Button>
      <Button
        onClick={() => {
          join(bots[bot].id, bots[bot].username);
        }}
        label="Join"
      ></Button>
    </Grommet>
  );
}

export default App;
