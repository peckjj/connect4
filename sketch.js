var ROWS     = 6;
var COLUMNS  = 7;
var IN_A_ROW = 4;

var EMPTY  = 0;
var PLAYER = 1;
var CPU    = 2;

var CPU_IS_FIRST = true;

var CPU_WIN_BIAS = 10000000000;
var CPU_3_BIAS   = 10;
var CPU_2_BIAS   = 5;

var PLAYER_WIN_BIAS = -10000000;
var PLAYER_3_BIAS   = -10000000;
var PLAYER_2_BIAS   = -100;

var CENTER_BIAS = 4;

var CPU_DEPTH = 4;

var nodes_explored = 0;
var boardImage;

function preload()
{
    boardImage = loadImage('assets/board.png');
}

function setup() 
{
  createCanvas(windowWidth / 2, windowHeight / 2, P2D);
  background(0);
  image(boardImage, 0, 0, width, height);
  noLoop();
}

function draw()
{
  
}


// Main game loop
function main()
{
    board = create_board();

    game_over = false
}