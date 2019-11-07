import io from "socket.io-client";

const socket = io("http://botws.generals.io");
const custom_game_id = "stook";
// const custom_game_id = "13fe3e51-fbc6-43ff";

export function join(userId, username) {
  socket.emit("set_username", userId, username);
  socket.emit("join_private", custom_game_id, userId);
}

export function start() {
  socket.emit("set_force_start", custom_game_id, true);
}

socket.on("disconnect", function() {
  console.error("Disconnected from server.");
});

socket.on("connect", function() {
  console.log("Connected to server.");

  // Join the 1v1 queue.
  // socket.emit('join_1v1', user_id);

  // Join the FFA queue.
  // socket.emit('play', user_id);

  // Join a 2v2 team.
  // socket.emit('join_team', 'team_name', user_id);
});


// Terrain Constants.
// Any tile with a nonnegative value is owned by the player corresponding to its value.
// For example, a tile with value 1 is owned by the player with playerIndex = 1.
const TILE_EMPTY = -1;
const TILE_MOUNTAIN = -2;
const TILE_FOG = -3;
const TILE_FOG_OBSTACLE = -4; // Cities and Mountains show up as Obstacles in the fog of war.

// Game rawData.
const game = {
  phase: 1,
  moving: false,
  justTurned: false,
  directions: {
    1: ["left", "down", "right", "up"],
    2: ["right", "down", "left", "up"]
  },
  currentIndex: -2,
  currentDirection: "left",
  directionIndex: -1,
  myGeneralIndex: null,
  playerIndex: -1,
  generals: [], // The indicies of generals we have vision of.
  cities: [], // The indicies of cities we have vision of.
  map: []
};

/* Returns a new array created by patching the diff into the old array.
 * The diff formatted with alternating matching and mismatching segments:
 * <Number of matching elements>
 * <Number of mismatching elements>
 * <The mismatching elements>
 * ... repeated until the end of diff.
 * Example 1: patching a diff of [1, 1, 3] onto [0, 0] yields [0, 3].
 * Example 2: patching a diff of [0, 1, 2, 1] onto [0, 0] yields [2, 0].
 */
function patch(old, diff) {
  var out = [];
  var i = 0;
  while (i < diff.length) {
    if (diff[i]) {
      // matching
      Array.prototype.push.apply(
        out,
        old.slice(out.length, out.length + diff[i])
      );
    }
    i++;
    if (i < diff.length && diff[i]) {
      // mismatching
      Array.prototype.push.apply(out, diff.slice(i + 1, i + 1 + diff[i]));
      i += diff[i];
    }
    i++;
  }
  return out;
}

socket.on("game_start", function(rawData) {
  // Get ready to start playing the game.
  game.playerIndex = rawData.playerIndex;
  var replay_url =
    "http://bot.generals.io/replays/" + encodeURIComponent(rawData.replay_id);
  console.log(
    "Game starting! The replay will be available after the game at " +
      replay_url
  );
});

const canMoveToIndex = (game, index) => {
  return game.terrain[index] > -2 && index >= 0 && index <= game.size;
};

const move = () => {
  const {
    currentIndex,
    currentDirection,
    width,
    myGeneralIndex,
    armies
  } = game;
  let endIndex = currentIndex;
  switch (currentDirection) {
    case "up":
      endIndex = currentIndex - width;
      break;
    case "down":
      endIndex = currentIndex + width;
      break;
    case "left":
      endIndex = currentIndex - 1;
      break;
    case "right":
      endIndex = currentIndex + 1;
      break;
    default:
  }
  if (canMoveToIndex(game, endIndex)) {
    socket.emit("attack", currentIndex, endIndex);
    game.currentIndex = endIndex;
  } else {
    turn(game);
  }
};
const turn = () => {
  if (game.directionIndex === 3) {
    game.directionIndex = 0;
  } else {
    game.directionIndex += 1;
  }

  game.currentDirection = game.directions[game.phase][game.directionIndex];
  game.justTurned = true;
};

const phaseShift = () => {
  if (game.directionIndex === 0 || game.directionIndex === 2) {
    game.directionIndex = 0;
  }
  game.phase = game.phase === 2 ? 1 : 2;
};
socket.on("game_update", function(rawData) {
  // Patch the city and map diffs into our local variables.
  game.cities = patch(game.cities, rawData.cities_diff);
  game.map = patch(game.map, rawData.map_diff);
  game.generals = rawData.generals;

  game.myGeneralIndex = game.generals[game.playerIndex];

  if (game.currentIndex === -2) {
    game.currentIndex = game.myGeneralIndex;
  }
  // The first two terms in |map| are the dimensions.
  game.width = game.map[0];
  game.height = game.map[1];
  game.size = game.width * game.height;

  // The next |size| terms are army values.
  // armies[0] is the top-left corner of the map.
  game.armies = game.map.slice(2, game.size + 2);

  // The last |game.size| terms are terrain values.
  // terrain[0] is the top-left corner of the map.
  game.terrain = game.map.slice(game.size + 2, game.size + 2 + game.size);

  if (game.armies[game.currentIndex] < 2) {
    game.currentIndex = game.myGeneralIndex;
  }

  game.currentIndex = game.currentIndex || game.myGeneralIndex;

  if (Math.random() > 0.95) {
    phaseShift(game);
  }
  if (game.justTurned && Math.random() > 0.8) {
    console.log("turning");
    // phaseShift(game);
    turn(game);
  }

  if (Math.random() > 0.95) {
    turn(game);
  }

  if (rawData.turn > 10) {
    move(game);
  }
  console.log(game);
  console.log(game.currentDirection);
  game.justTurned = false;

  return;

  // wait until home square has 5
  // move left until obstacle then move around it
  //
  // wait until home square has 5
  // move right until obstacle then move around it
  //
  // wait until home square has 5
  // move up until obstacle then move around it
  //
  // wait until home square has 5
  // move down until obstacle then move around it

  // fill in ones around

  // Make a random move.
  // while (true) {
  //   // Pick a random tile.
  //   var index = Math.floor(Math.random() * size);
  //
  //   // If we own this tile, make a random move starting from it.
  //   if (terrain[index] === playerIndex) {
  //     var row = Math.floor(index / width);
  //     var col = index % width;
  //     var endIndex = index;
  //
  //     var rand = Math.random();
  //     if (rand < 0.25 && col > 0) {
  //       // left
  //       // endIndex--;
  //       moveLeft(index);
  //     } else if (rand < 0.5 && col < width - 1) {
  //       // right
  //       // endIndex++;
  //       moveRight(index);
  //     } else if (rand < 0.75 && row < height - 1) {
  //       // down
  //       // endIndex += width;
  //       moveDown(index, width);
  //     } else if (row > 0) {
  //       //up
  //       // endIndex -= width;
  //       moveUp(index, width);
  //     } else {
  //       continue;
  //     }
  //
  //     // Would we be attacking a city? Don't attack cities.
  //     if (cities.indexOf(endIndex) >= 0) {
  //       continue;
  //     }
  //
  //     socket.emit("attack", index, endIndex);
  //     break;
  //   }
  // }
});

function leaveGame() {
  socket.emit("leave_game");
}

socket.on("game_lost", leaveGame);

socket.on("game_won", leaveGame);
