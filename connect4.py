import numpy as np
from os import system
import random

ROWS     = 6
COLUMNS  = 7
IN_A_ROW = 4

EMPTY  = 0
PLAYER = 1
CPU    = 2

CPU_IS_FIRST = True

CPU_WIN_BIAS = 10000000000
CPU_3_BIAS   = 10
CPU_2_BIAS   = 5

PLAYER_WIN_BIAS = -10000000
PLAYER_3_BIAS   = -10000000
PLAYER_2_BIAS   = -100 

CENTER_BIAS = 4

CPU_DEPTH = 4

nodes_explored = 0

def main():
    global nodes_explored

    board = create_board()

    game_over = False
    turn = CPU_IS_FIRST

    # Main game loop
    while not game_over:
        print_board(board)

        if turn:
            # CPU moves
            # cpu_move_random(board)
            # player_move(board, CPU)
            # cpu_smart_move(board)
            cpu_minimax_move(board, CPU_DEPTH)

            game_over = check_endgame(board, CPU)
            if game_over:
                print_board(board)
                print('you lose')
                break
        else:
            # Player moves
            nodes_explored = 0
            player_move(board, PLAYER)

            game_over = check_endgame(board, PLAYER)
            if game_over:
                print_board(board)
                print('you win')
                break
        turn = not turn

def score_board(board):
    score = 0

    # Score horizontal
    for col in range(COLUMNS - (IN_A_ROW - 1)):
        for row in range(ROWS):
            score += score_window(list(board[row][col:col + IN_A_ROW]))

    # Score vertical
    for col in range(COLUMNS):
        for row in range(ROWS - (IN_A_ROW - 1)):
            window = []
            for i in range(IN_A_ROW):
                window.append(board[row + i][col])
            score += score_window(window)

    # Score forwardslashers
    for col in range(COLUMNS - (IN_A_ROW - 1)):
        for row in range(ROWS - (IN_A_ROW - 1)):
            window = []
            for i in range(IN_A_ROW):
                window.append(board[row + i][col + i])
            score += score_window(window)

    # Score backslashers
    for col in range((IN_A_ROW - 1), COLUMNS):
        for row in range(ROWS - (IN_A_ROW - 1)):
            window = []
            for i in range(IN_A_ROW):
                window.append(board[row + i][col - i])
            score += score_window(window)

    return score

def score_window(window):
    ai_count = window.count(CPU)
    player_count = window.count(PLAYER)
    empty_count = window.count(EMPTY)

    # AI victory
    if ai_count == IN_A_ROW:
        return CPU_WIN_BIAS
    # AI with 3
    elif ai_count == 3 and empty_count == 1:
        return CPU_3_BIAS
    # AI with 2
    elif ai_count == 2 and empty_count == 2:
        return CPU_2_BIAS
    # Player with 3
    elif player_count == 3 and empty_count == 1:
        return PLAYER_3_BIAS
    # Player with 2
    elif player_count == 2 and empty_count == 2:
        return PLAYER_2_BIAS
    return 0

def cpu_move_random(board):
    drop_piece(board, random.choice(get_valid_moves(board)), CPU)

def cpu_smart_move(board):
    best_score = -np.Infinity
    moves = get_valid_moves(board)
    best_col = random.choice(moves)

    for move in moves:
        new_board = board.copy()
        drop_piece(new_board, move, CPU)

        new_board_score = score_board(new_board)

        # Weight center heavier
        if move == COLUMNS // 2:
            new_board_score += CENTER_BIAS

        if new_board_score > best_score:
            best_score = new_board_score
            best_col = move
    
    drop_piece(board, best_col, CPU)


def minimax(board, depth, a, b, isMax):
    global nodes_explored

    nodes_explored += 1

    if depth == 0 or check_endgame(board, CPU) or check_endgame(board, PLAYER):
        return None, score_board(board)
    
    if isMax:
        value = -np.Infinity
        moves = get_valid_moves(board)
        best_col = random.choice(moves)

        for move in moves:
            new_board = board.copy()
            drop_piece(new_board, move, CPU)
            new_board_score = minimax(new_board, depth - 1, a, b, False)[1]
            
            # Weight center heavier
            if move == COLUMNS // 2:
                new_board_score += CENTER_BIAS

            if new_board_score > value:
                value = new_board_score
                best_col = move
            
            a = max(a, value)
            
            if a >= b:
                break
        return best_col, value
    else:
        value = np.Infinity
        moves = get_valid_moves(board)
        best_col = random.choice(moves)

        for move in moves:
            new_board = board.copy()
            drop_piece(new_board, move, PLAYER)
            new_board_score = minimax(new_board, depth - 1, a, b, True)[1]

            if new_board_score < value:
                value = new_board_score
                best_col = move
            
            b = min(b, value)

            if b <= a:
                break
        return best_col, value

def cpu_minimax_move(board, depth):
    drop_piece(board, minimax(board, depth, -np.Infinity, np.Infinity, True)[0], CPU)

def player_move(board, piece):
    col = int(input('Select column to drop piece:'))

    while not is_valid_move(board, col):
        col = int(input('Select valid column:'))
    
    drop_piece(board, col, piece)

def check_endgame(board, piece):
    # Check horizontal
    for col in range(COLUMNS - (IN_A_ROW - 1)):
        for row in  range(ROWS):
            if list(board[row][col:col + IN_A_ROW]).count(piece) == IN_A_ROW:
                return True

    # Check vertical
    for col in range(COLUMNS):
        for row in range(ROWS - (IN_A_ROW - 1)):
            count = 0
            for i in range(IN_A_ROW):
                if board[row + i][col] == piece:
                    count += 1
            if count == IN_A_ROW:
                return True

    # Check forwardslashers
    for col in range(COLUMNS - (IN_A_ROW - 1)):
        for row in range(ROWS - (IN_A_ROW - 1)):
            count = 0
            for i in range(IN_A_ROW):
                if board[row + i][col + i] == piece:
                    count += 1
            if count == IN_A_ROW:
                return True
    
    # Check backslashers
    for col in range((IN_A_ROW - 1), COLUMNS):
        for row in range(ROWS - (IN_A_ROW - 1)):
            count = 0
            for i in range(IN_A_ROW):
                if board[row + i][col - i] == piece:
                    count += 1
            if count == IN_A_ROW:
                return True

    # Check full board
    if len(get_valid_moves(board)) == 0:
        return True

    return False

def get_valid_moves(board):
    valid_moves = []
    for col in range(COLUMNS):
        if is_valid_move(board, col):
            valid_moves.append(col)
    return valid_moves

def drop_piece(board, col, piece):
    row = get_next_row(board, col)

    board[row][col] = piece

def get_next_row(board, col):
    for y in range(ROWS):
        if board[y][col] == 0:
            return y
    return -1

def is_valid_move(board, col):
    return (col >= 0 and col < COLUMNS) and board[ROWS - 1][col] == 0

def print_board(board):
    clear()
    print(f' {np.array([i for i in range(COLUMNS)])}')
    print()
    print(np.flip(board, 0))
    print(f'nodes explored: {nodes_explored}')

def create_board():
    return np.zeros((ROWS, COLUMNS), dtype="int8")



def clear():
    system('cls')


if __name__ == '__main__':
    main()