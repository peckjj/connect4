var ROWS     = 6;
var COLUMNS  = 7;
var IN_A_ROW = 4;

var EMPTY  = 0;
var PLAYER = 1;
var CPU    = 2;

var PLAYER_IS_CPU = true;
var CPU_IS_FIRST = true;

var CPU_WIN_BIAS = 10000000000000;
var CPU_3_BIAS   = 20;
var CPU_2_BIAS   = 10;

var PLAYER_CAN_WIN_BIAS = -10000000;
var PLAYER_3_BIAS   = -100000;
var PLAYER_2_BIAS   = -20;

var CENTER_BIAS = 10;

var CPU_DEPTH = 10;

var nodes_explored = 0;
var boardImage;

var CPU_COLOR;
var PLAYER_COLOR;

var HEIGHT_ADJUSTER = 0.9;
var WIDTH_ADJUSTER  = 0.8;

var playerSelection;
var playerSelected = false;

board = create_board();
game_over = false;
turn = CPU_IS_FIRST;

function preload()
{
    boardImage = loadImage('assets/board.png');
}

function setup() 
{
  CPU_COLOR = color(255, 204, 0);
  PLAYER_COLOR = color(255, 100, 100);

  frameRate(10);

  createCanvas(windowWidth / 2, windowHeight / 2);
  background(0);
  //image(boardImage, 0, 0, width, height);
  //noLoop();
  //main();
  CPU_DEPTH = 6;//parseInt(window.prompt('enter depth'));
  player = true;//window.prompt('cpu vs player? (y/n)');

  PLAYER_IS_CPU = false;//player != "y";
}

function draw()
{
  // Main game loop
  if (!game_over)
  {
      if (turn)
      {
          // # CPU moves
          // # cpu_move_random(board)
          // # player_move(board, CPU)
          //cpu_smart_move(board)
          cpu_minimax_move(board, CPU_DEPTH);

          game_over = check_endgame(board, CPU);
          if (game_over)
          {
              alert('you lost :(');
              console.log('you lose');
          }
          turn = !turn;
      }
      else
      {
          // # Player moves
          nodes_explored = 0;
          if (PLAYER_IS_CPU)
          {
            temp = CPU;
            CPU = PLAYER;
            PLAYER = temp;
            cpu_minimax_move(board, CPU_DEPTH);
            temp = CPU;
            CPU = PLAYER;
            PLAYER = temp;
            
            game_over = check_endgame(board, PLAYER);
                if (game_over)
                {
                    alert('you win!');
                    console.log('you win');
                }

            turn = !turn;
          }
          else
          {
            if (playerSelected)
            {
                player_move(board, PLAYER);

                game_over = check_endgame(board, PLAYER);
                if (game_over)
                {
                    alert('you win!');
                    console.log('you win');
                }
                playerSelected = false;
                turn = !turn;
            }
          }
      }
  }
  else
  {
      print_board(board);
      noLoop();
  }
  print_board(board);
}

function deepCopy(arr)
{
    let newArr = Array(arr.length);
    for (i = 0; i < newArr.length; i++)
    {
        newArr[i] = arr[i].slice();
    }
    return newArr;
}

function countElem(arr, val)
{
    let counter = 0;
    for (let i = 0; i < arr.length; i++)
    {
        counter += arr[i] == val ? 1 : 0;
    }
    return counter;
}

function score_board(board)
{
    var score = 0;

    // # Score horizontal
    for (let col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (let row = 0; row < ROWS; row++)
        {
            score += score_window((board[row].slice(col, col + IN_A_ROW)));
        }
    }

    // # Score vertical
    for (let col = 0; col < COLUMNS; col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let win = [];
            for (let i = 0; i < IN_A_ROW; i++)
            {
                win.push(board[row + i][col]);
            }
            score += score_window(win);
        }
    }

    // # Score forwardslashers
    for (let col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let win = [];
            for (let i = 0; i < IN_A_ROW; i++)
            {
                win.push(board[row + i][col + i]);
            }
            score += score_window(win);
        }
    }

    // # Score backslashers
    for (let col = IN_A_ROW - 1; col < COLUMNS; col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let win = [];
            for (let i = 0; i < IN_A_ROW; i++)
            {
                win.push(board[row + i][col - i]);
            }
            score += score_window(win);
        }
    }

    if (playerCanWin(board))
    {
        score += PLAYER_CAN_WIN_BIAS;
    }

    return score;
}

function playerCanWin(board)
{
    let moves = get_valid_moves(board);

    for (let move of moves)
    {
        let new_board = deepCopy(board);
        drop_piece(new_board, move, PLAYER);
        if (check_endgame(board, PLAYER))
        {
            return true;
        }
    }
    return false;
}

function score_window(win)
{
    let ai_count = countElem(win, CPU);
    let player_count = countElem(win, PLAYER);
    let empty_count = countElem(win, EMPTY);

    // # AI victory
    if (ai_count == IN_A_ROW)
    {
        return CPU_WIN_BIAS;
    }
    // # AI with 3
    else if (ai_count == 3 && empty_count == 1)
    {
        return CPU_3_BIAS;
    }
    // # AI with 2
    else if (ai_count == 2 && empty_count == 2)
    {
        return CPU_2_BIAS;
    }
    // # Player with 3
    else if (player_count == 3 && empty_count == 1)
    {
        return PLAYER_3_BIAS;
    }
    // # Player with 2
    else if (player_count == 2 && empty_count == 2)
    {
        return PLAYER_2_BIAS;
    }
    return 0;
}

function cpu_move_random(board)
{
    drop_piece(board, random(get_valid_moves(board)), CPU);
}

function cpu_smart_move(board)
{
    let best_score = -Infinity;
    let moves = get_valid_moves(board);
    let best_col = random(moves);

    for (let move of moves)
    {
        let new_board = deepCopy(board);
        drop_piece(new_board, move, CPU);

        let new_board_score = score_board(new_board);

        // # Weight center heavier
        if ( move == floor(COLUMNS / 2) )
        {
            new_board_score += CENTER_BIAS;
        }

        if (new_board_score > best_score)
        {
            best_score = new_board_score;
            best_col = move;
        }
    }
    drop_piece(board, best_col, CPU);
}

function minimax(board, depth, a, b, isMax)
{
    nodes_explored += 1;

    if (depth == 0 || check_endgame(board, CPU) || check_endgame(board, PLAYER))
    {
        return [null, score_board(board)];
    }
    
    if (isMax)
    {
        let value = -Infinity;
        let moves = get_valid_moves(board);
        let best_col = random(moves);

        for (let move of moves)
        {
            let new_board = deepCopy(board);
            drop_piece(new_board, move, CPU);
            let new_board_score = minimax(new_board, depth - 1, a, b, false)[1];
            
            // # Weight center heavier
            if (move == floor(COLUMNS / 2))
            {
                new_board_score += CENTER_BIAS;
            }

            if (new_board_score > value)
            {
                value = new_board_score;
                best_col = move;
            }
            
            a = max(a, value);
            
            if (a >= b)
            {
                break;
            }
        }
        return [best_col, value];
    }
    else
    {
        let value = Infinity;
        let moves = get_valid_moves(board);
        let best_col = random(moves);

        for (let move of moves)
        {
            let new_board = deepCopy(board);
            drop_piece(new_board, move, PLAYER);
            let new_board_score = minimax(new_board, depth - 1, a, b, true)[1];

            if (new_board_score < value)
            {
                value = new_board_score;
                best_col = move;
            }

            b = min(b, value);

            if (b <= a)
            {
                break;
            }
        }
        return [best_col, value];
    }
}

function cpu_minimax_move(board, depth)
{
    let best_col = minimax(board, depth, -Infinity, Infinity, true)[0]

    drop_piece(board, best_col, CPU);
}

function player_move(board, piece)
{
    let col = playerSelection;

    drop_piece(board, col, piece);
}

function check_endgame(board, piece)
{
    // # Check horizontal
    for (let col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (let row = 0; row < ROWS; row++)
        {
            let count = 0;
            for (let i = 0; i < IN_A_ROW; i++)
            {
                if (board[row][col + i] == piece)
                {
                    count += 1;
                }
            }
            if (count == IN_A_ROW)
            {
                return true;
            }
        }
    }

    // # Check vertical
    for (let col = 0; col < COLUMNS; col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let count = 0;
            for (let i = 0; i < IN_A_ROW; i++)
            {
                if (board[row + i][col] == piece)
                {
                    count += 1;
                }
            }
            if (count == IN_A_ROW)
            {
                return true;
            }
        }
    }

    // # Check forwardslashers
    for (let col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let count = 0;
            for (let i = 0; i < IN_A_ROW; i++)
            {
                if (board[row + i][col + i] == piece)
                {
                    count += 1;
                }
            }
            if (count == IN_A_ROW)
            {
                return true;
            }
        }
    }

    // # Check backslashers
    for (let col = IN_A_ROW - 1; col < COLUMNS; col++)
    {
        for (let row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            let count = 0;
            for (let i = 0; i < IN_A_ROW; i++)
            {
                if (board[row + i][col - i] == piece)
                {
                    count += 1;
                }
            }
            if (count == IN_A_ROW)
            {
                return true;
            }
        }
    }

    // # Check full board
    if (get_valid_moves(board).length == 0)
    {
        return true;
    }

    return false;
}

function get_valid_moves(board)
{
    let valid_moves = [];
    for (let col = 0; col < COLUMNS; col++)
    {
        if (is_valid_move(board, col))
        {
            valid_moves.push(col);
        }
    }
    return valid_moves;
}

function drop_piece(board, col, piece)
{
    let row = get_next_row(board, col);

    board[row][col] = piece;
}

function get_next_row(board, col)
{
    for (let y = 0; y < ROWS; y++)
    {
        if (board[y][col] == 0)
        {
            return y;
        }
    }
    return -1;
}

function is_valid_move(board, col)
{
    return (col >= 0 && col < COLUMNS) && board[ROWS - 1][col] == 0;
}

function print_board(board)
{
    console.log(' 0 1 2 3 4 5 6');
    console.log();
    console.log(board);
    console.log('nodes explored: ${nodes_explored}');
    drawBoard(board);
}

function drawBoard(board)
{
    background(0);
    for (row = 0; row < ROWS; row++)
    {
        for (col = 0; col < COLUMNS; col++)
        {
            if (board[row][col] == PLAYER)
            {
                drawPiece(row, col, PLAYER_COLOR);
            }
            else if (board[row][col] == CPU)
            {
                drawPiece(row, col, CPU_COLOR);
            }
        }
    }
    image(boardImage, 0, 0, width, height);
}

function drawPiece(row, col, color)
{
    push();
    stroke(color);
    fill(color);

    ellipse(col * (width / COLUMNS) + ((width / COLUMNS) / 2), height - (row * (height / ROWS)) - ((height/ROWS) / 2), (width/COLUMNS) * WIDTH_ADJUSTER, (height/ROWS) * HEIGHT_ADJUSTER);
}

function create_board()
{
    let board = Array(ROWS);
    for (let i = 0; i < board.length; i++)
    {
        board[i] = Array(COLUMNS);
    }

    for (let row = 0; row < board.length; row++)
    {
        for (let col = 0; col < board[row].length; col++)
        {
            board[row][col] = 0;
        }
    }
    return board;
}

function mousePressed()
{
    playerSelected = true;

    playerSelection = floor(mouseX / (width / COLUMNS));
}