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
  main();
}

function draw()
{
  
}


// Main game loop
function main()
{
    board = create_board();

    game_over = false;
    turn = CPU_IS_FIRST;

    // Main game loop
    while (!game_over)
    {
        print_board(board);

        if (turn)
        {
            // # CPU moves
            // # cpu_move_random(board)
            // # player_move(board, CPU)
            // # cpu_smart_move(board)
            cpu_minimax_move(board, CPU_DEPTH);

            game_over = check_endgame(board, CPU);
            if (game_over)
            {
                print_board(board);
                console.log('you lose');
                break;
            }
        }
        else
        {
            // # Player moves
            nodes_explored = 0;
            player_move(board, PLAYER);

            game_over = check_endgame(board, PLAYER);
            if (game_over)
            {
                print_board(board);
                console.log('you win');
                break;
            }
        }
        turn = !turn;
    }
}

function score_board(board)
{
    score = 0;

    // # Score horizontal
    for (col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (row = 0; row < ROWS; row++)
        {
            score += score_window((board[row].slice(col, col + IN_A_ROW)));
        }
    }

    // # Score vertical
    for (col = 0; col < COLUMNS; col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            window = [];
            for (i = 0; i < IN_A_ROW; i++)
            {
                window.push(board[row + i][col]);
            }
            score += score_window(window);
        }
    }

    // # Score forwardslashers
    for (col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            window = [];
            for (i = 0; i < IN_A_ROW; i++)
            {
                window.push(board[row + i][col + i]);
            }
            score += score_window(window);
        }
    }

    // # Score backslashers
    for (col = IN_A_ROW - 1; col < COLUMNS; col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            window = [];
            for (i = 0; i < IN_A_ROW; i++)
            {
                window.push(board[row + i][col - i]);
            }
            score += score_window(window);
        }
    }

    return score;
}

function count(arr, val)
{
    counter = 0;
    for (i = 0; i < arr.length; i++)
    {
        counter += arr[i] == val ? 1 : 0;
    }
    return counter;
}

function score_window(window)
{
    ai_count = count(window, CPU);
    player_count = count(window, PLAYER);
    empty_count = count(window, EMPTY);

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
    drop_piece(board, random.choice(get_valid_moves(board)), CPU);
}

function cpu_smart_move(board)
{
    best_score = -Infinity;
    moves = get_valid_moves(board);
    best_col = random.choice(moves);

    for (move of moves)
    {
        new_board = [...board];
        drop_piece(new_board, move, CPU);

        new_board_score = score_board(new_board);

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
        return [None, score_board(board)];
    }
    
    if (isMax)
    {
        value = -Infinity;
        moves = get_valid_moves(board);
        best_col = random.choice(moves);

        for (move of moves)
        {
            new_board = [...board];
            drop_piece(new_board, move, CPU);
            new_board_score = minimax(new_board, depth - 1, a, b, false)[1];
            
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
        value = Infinity;
        moves = get_valid_moves(board);
        best_col = random.choice(moves);

        for (move of moves)
        {
            new_board = [...board];
            drop_piece(new_board, move, PLAYER);
            new_board_score = minimax(new_board, depth - 1, a, b, true)[1];

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
    drop_piece(board, minimax(board, depth, -Infinity, Infinity, true)[0], CPU);
}

function player_move(board, piece)
{
    col = int(input('Select column to drop piece:'));

    while (!is_valid_move(board, col))
    {
        col = int(input('Select valid column:'));
    }
    
    drop_piece(board, col, piece);
}

function check_endgame(board, piece)
{
    // # Check horizontal
    for (col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (row = 0; row < ROWS; row++)
        {
            if (count(board[row].slice(col, col + IN_A_ROW), piece) == IN_A_ROW)
            {
                return true;
            }
        }
    }

    // # Check vertical
    for (col = 0; col < COLUMNS; col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            count = 0;
            for (i = 0; i < IN_A_ROW; i++)
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
    for (col = 0; col < COLUMNS - (IN_A_ROW - 1); col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            count = 0;
            for (i = 0; i < IN_A_ROW; i++)
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
    for (col = IN_A_ROW - 1; col < COLUMNS; col++)
    {
        for (row = 0; row < ROWS - (IN_A_ROW - 1); row++)
        {
            count = 0;
            for (i = 0; i < IN_A_ROW; i++)
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
    valid_moves = [];
    for (col = 0; col < COLUMNS; col++)
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
    row = get_next_row(board, col);

    board[row][col] = piece;
}

function get_next_row(board, col)
{
    for (y = 0; i < ROWS; y++)
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
}

function create_board()
{
    board = Array(ROWS);
    for (i = 0; i < board.length; i++)
    {
        board = [0, 0, 0, 0, 0, 0, 0];
    }
    return board;
}