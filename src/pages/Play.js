import React from "react";
import { start, join } from "../bot/bot.js";
import { Button, Box } from "grommet";

export default function Play({ match }) {
  const bot = match.params.bot;
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
    <Box pad="medium">
      <div>
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
      </div>
    </Box>
  );
}
