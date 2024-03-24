'use strict';

const tileSize = 32;
const playerSize = tileSize;
const moveSpeed = 0.1;
const roomSize = { x: -25, y: 0, width: 25, height: 7 };
const players = {};
var playerPosition = { x: 0, y: 0 };
var targetPosition = playerPosition;
var canvas;
var ctx;
var playerid = Math.floor(Math.random() * 100);
var sprites;
var speechBubbles;

function roomInit() {
  // Check page
  var div = $('#c');
  if (!div.length) return;
  if (socket == null) { console.log("Error: room.js needs to be included after chat.js"); return; }

  // Get new player positions
  socket.on('player', (player) => {
    // If we already know of this player, keep their position
    if (players[player.id] != null) {
      player.x = players[player.id].x;
      player.y = players[player.id].y;
    }
    players[player.id] = player;
  });

  // Set start position
  newPlayerPosition(0, 0);

  // Move
  $(document).on('keydown', (e) => {
    var x = targetPosition.x, y = targetPosition.y;
    if      (e.key === 'ArrowUp')    y--;
    else if (e.key === 'ArrowDown')  y++;
    else if (e.key === 'ArrowLeft')  x--;
    else if (e.key === 'ArrowRight') x++;
    newPlayerPosition(x, y);
  });

  // Click tap move
  $('#c').on('click', (e) => {
    const rect = $('#c')[0].getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const ddx = (mouseX - rect.width / 2 ) / 100;
    const ddy = (mouseY - rect.height / 2 ) / 100;
    var x = targetPosition.x + ddx;
    var y = targetPosition.y + ddy;
    newPlayerPosition(x, y);
  });

  // Loop
  gameLoop();
}

function newPlayerPosition(x, y) {
  // Keep in room
  var nx = targetPosition.x;
  var ny = targetPosition.y;
  if (x >= roomSize.x && x < roomSize.width ) nx = x;
  if (y >= roomSize.y && y < roomSize.height) ny = y;
  targetPosition = {x: nx, y: ny};

  // Send
  var text = "Hello " + Math.floor(Math.random() * 100);
  const room = document.getElementById('chatRoomSelect').value;
  var player = {room: room, id: playerid, text: text, x: playerPosition.x, y: playerPosition.y, targetx: targetPosition.x, targety: targetPosition.y};
  socket.emit('player', player);
  //console.log("Sent: ", player);
}

// Draw players
function drawPlayers() {
  // Add any new sprites
  while (sprites?.length < Object.keys(players).length) {
      sprites.push(createSprite(geometry, 0xDDDDFF, 0));
      speechBubbles.push(createSpeechBubble("", 0, 0, 0));
      console.log("Added ", sprites.length, Object.keys(players).length);
  }

  // Draw
  var i = 0;
  for (const id in players) {
    // Update position to target
    const player = players[id];
    if (player.x !== player.targetx || player.y !== player.targety) {
      player.x += (player.targetx - player.x) * moveSpeed;
      player.y += (player.targety - player.y) * moveSpeed;
    }

    // Position 3D sprites
    if (i < sprites?.length) {
      sprites[i].position.x = player.x;
      sprites[i].position.z = player.y - 7;
      updateSpeechBubble(speechBubbles[i], player.text, sprites[i]);
    }
    i++;
  }
}

function gameLoop() {
  drawPlayers();
  requestAnimationFrame(gameLoop);
}

// Run
$(function() {
  roomInit();
});
