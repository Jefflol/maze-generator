var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var slider_cell_size = document.getElementById("cell-size");
var slider_horizontal_bias = document.getElementById("horizontal-bias");
var generate_btn = document.getElementById("generate");
generate_btn.addEventListener("click", generate);

var HORIZONTAL_BIAS = slider_horizontal_bias.value/100.0;
var SQ = CELL_SIZE = [5, 17, 20, 45][slider_cell_size.value];

const WALL_WIDTH = 5;
var MAZE_WIDTH = Math.floor(canvas.width/(SQ+WALL_WIDTH));
var MAZE_HEIGHT = Math.floor(canvas.height/(SQ+WALL_WIDTH));

const NORTH = 0b1000;
const EAST = 0b0100;
const SOUTH = 0b0010;
const WEST = 0b0001;
const NONE = 0b0000;

var stack;                // Stack to hold cells
var maze;                 // Grid to track visited cells
var visitedCellCount;     // Keep counts of number of visited cells
var next_cell;            // Object for the next cell to visit
var current_cell;         // Object for the current cell
var interval;             // Loops the drawing

drawCanvas();
drawGrid();


function main() {
  if(next_cell != -1) {
    current_cell.dir |= next_cell.dir;

    stack.push(current_cell);

    let dir_from = getOppositeDirection(next_cell.dir);

    current_cell = new Cell(next_cell.x, next_cell.y, dir_from);
    maze[current_cell.x][current_cell.y] = true;
    visitedCellCount++;
    drawCell(current_cell, 'purple');
    removeWalls(current_cell);

    next_cell = getRandomDirection(current_cell);

    while(next_cell === -1 && stack.length > 0) {
      current_cell = stack.pop();
      next_cell = getRandomDirection(current_cell);
      removeWalls(current_cell);
    }
  } else {
    let start = {x: 0, y: 0, dir: NONE};
    drawCell(start, 'red');
    drawCell(end, 'green');
    removeWalls(end);
    clearInterval(interval);
  }
}

/* Resets and generates a new grid according to users input */
function generate() {
  SQ = [5, 17, 20, 45][slider_cell_size.value];
  HORIZONTAL_BIAS = slider_horizontal_bias.value/100.0;
  MAZE_WIDTH = Math.floor(canvas.width/(SQ+WALL_WIDTH));
  MAZE_HEIGHT = Math.floor(canvas.height/(SQ+WALL_WIDTH));

  // Reset
  drawCanvas();
  drawGrid();

  stack = [];
  visitedCellCount = 0;
  maze = Array.from(Array(MAZE_WIDTH), () => Array(MAZE_HEIGHT).fill(false));

  // Randomly select direction you can visit the end goal
  end = {x: MAZE_WIDTH-1, y: MAZE_HEIGHT-1, dir: Math.random() < 0.5 ? WEST : NORTH};
  maze[end.x][end.y] = true;

  // Generate
  current_cell = new Cell(0, 0, NONE);
  maze[current_cell.x][current_cell.y] = true;
  visitedCellCount++;
  drawCell(current_cell, 'purple');
  next_cell = getRandomDirection(current_cell);

  // Start loop
  interval = setInterval(main, 1);
}

/* Returns a new cell object containing its direction relative to the current cell */
function getRandomDirection(cell) {
  let neighbours = [];

  // Check East
  if(cell.x + 1 < MAZE_WIDTH && maze[cell.x + 1][cell.y] === false) {
    neighbours.push({
      x: cell.x + 1,
      y: cell.y,
      dir: EAST,
    })
  }

  // Check West
  if(cell.x - 1 >= 0 && maze[cell.x - 1][cell.y] === false) {
    neighbours.push({
      x: cell.x - 1,
      y: cell.y,
      dir: WEST,
    })
  }

  // Check South
  if(cell.y + 1 < MAZE_HEIGHT && maze[cell.x][cell.y + 1] === false) {
    neighbours.push({
      x: cell.x,
      y: cell.y + 1,
      dir: SOUTH,
    })
  }

  // Check North
  if(cell.y - 1 >= 0 && maze[cell.x][cell.y - 1] === false) {
    neighbours.push({
      x: cell.x,
      y: cell.y - 1,
      dir: NORTH,
    })
  }

  if(neighbours.length > 0 ){
    let rand = getRandomIndex(neighbours.length);
    return neighbours[rand];
  }
  else
    return -1;
}

/* Helper function to get a random index of the neighbour array of current cell.
   Also takes into account of horizontal bias */
function getRandomIndex(n) {
  let rand_min = 0;
  let rand_max = n/2;

  let r = Math.random();

  // Add horizontal bias
  if(r > HORIZONTAL_BIAS)
    rand_max = n;

  return Math.floor(Math.random() * (rand_max - rand_min) + rand_min);
}

/* Helper function to return the opposite direction.
   This is used to get the direction the new cell came from. */
function getOppositeDirection(dir) {
  let x;

  if(dir === NORTH) x = SOUTH;
  else if(dir === SOUTH) x = NORTH;
  else if(dir === WEST) x = EAST;
  else if(dir === EAST) x = WEST;

  return x
}

/* Removes walls of the neighbours the current cell can visit */
function removeWalls(cell) {
  if(((1 << 3) & cell.dir) != 0) removeWall(cell, NORTH, "purple");
  if(((1 << 2) & cell.dir) != 0) removeWall(cell, EAST, "purple");
  if(((1 << 1) & cell.dir) != 0) removeWall(cell, SOUTH, "purple");
  if(((1 << 0) & cell.dir) != 0) removeWall(cell, WEST, "purple");
}

/* Helper function to remove a side wall of a given cell */
function removeWall(cell, side, color='blue') {
  ctx.beginPath();
  ctx.fillStyle = color;

  switch(side) {
    case NORTH:
      ctx.fillRect(cell.x*(SQ + WALL_WIDTH) + WALL_WIDTH, cell.y*(SQ + WALL_WIDTH), SQ, WALL_WIDTH);
      break;
    case EAST:
      ctx.fillRect(cell.x*(SQ + WALL_WIDTH) + WALL_WIDTH + SQ, cell.y*(SQ + WALL_WIDTH) + WALL_WIDTH, WALL_WIDTH, SQ);
      break;
    case SOUTH:
      ctx.fillRect(cell.x*(SQ + WALL_WIDTH) + WALL_WIDTH, cell.y*(SQ + WALL_WIDTH) + WALL_WIDTH + SQ, SQ, WALL_WIDTH);
      break;
    case WEST:
      ctx.fillRect(cell.x*(SQ + WALL_WIDTH), cell.y*(SQ + WALL_WIDTH) + WALL_WIDTH, WALL_WIDTH, SQ);
      break;
    default:
      ctx.fillRect(cell.x*(SQ + WALL_WIDTH) + WALL_WIDTH + SQ, cell.y*(SQ + WALL_WIDTH) + WALL_WIDTH + SQ, WALL_WIDTH, WALL_WIDTH);
      break;
  }
}

/* Draws the canvas */
function drawCanvas() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/* Draws the initial grid of cells */
function drawGrid() {
  let cell = {
    x: 0,
    y: 0
  };

  for(let i = 0; i < MAZE_WIDTH; i++) {
    for(let j = 0; j < MAZE_HEIGHT; j++) {
      cell.x = i;
      cell.y = j;
      drawCell(cell);
    }
  }
}

/* Draws a single cell */
function drawCell(cell, color='blue') {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(cell.x*(SQ + WALL_WIDTH) + WALL_WIDTH, cell.y*(SQ + WALL_WIDTH) + WALL_WIDTH, SQ, SQ);
}

/* Constructor for a cell object */
function Cell(x, y, dir) {
  this.x = x;
  this.y = y;
  this.dir = dir;
  return this;
}
