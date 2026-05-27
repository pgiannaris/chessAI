const gameCanvas = document.querySelector(".gameCanvas");
gameCanvas.innerHTML = "";
let enPassantTarget = null;
let board = [
    [
        { piece: "r", moved: false, color: "black" },
        { piece: "n", moved: false, color: "black" },
        { piece: "b", moved: false, color: "black" },
        { piece: "q", moved: false, color: "black" },
        { piece: "k", moved: false, color: "black" },
        { piece: "b", moved: false, color: "black" },
        { piece: "n", moved: false, color: "black" },
        { piece: "r", moved: false, color: "black" },
    ],

    [
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
    ],

    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],

    [
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
    ],

    [
        { piece: "r", moved: false, color: "white" },
        { piece: "n", moved: false, color: "white" },
        { piece: "b", moved: false, color: "white" },
        { piece: "q", moved: false, color: "white" },
        { piece: "k", moved: false, color: "white" },
        { piece: "b", moved: false, color: "white" },
        { piece: "n", moved: false, color: "white" },
        { piece: "r", moved: false, color: "white" },
    ],
];

const startBoard = [
    [
        { piece: "r", moved: false, color: "black" },
        { piece: "n", moved: false, color: "black" },
        { piece: "b", moved: false, color: "black" },
        { piece: "q", moved: false, color: "black" },
        { piece: "k", moved: false, color: "black" },
        { piece: "b", moved: false, color: "black" },
        { piece: "n", moved: false, color: "black" },
        { piece: "r", moved: false, color: "black" },
    ],

    [
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
        { piece: "p", moved: false, color: "black" },
    ],

    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],

    [
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
        { piece: "p", moved: false, color: "white" },
    ],

    [
        { piece: "r", moved: false, color: "white" },
        { piece: "n", moved: false, color: "white" },
        { piece: "b", moved: false, color: "white" },
        { piece: "q", moved: false, color: "white" },
        { piece: "k", moved: false, color: "white" },
        { piece: "b", moved: false, color: "white" },
        { piece: "n", moved: false, color: "white" },
        { piece: "r", moved: false, color: "white" },
    ],
];

let nextMoveColor = "white";
const pieces = {
    p: "♟",
    wp: "♙",

    r: "♜",
    wr: "♖",

    n: "♞",
    wn: "♘",

    b: "♝",
    wb: "♗",

    q: "♛",
    wq: "♕",

    k: "♚",
    wk: "♔",
};

let selectedRow = null;
let selectedCol = null;
let isSelected = false;
let isBotThinking = false;

function indexToRowAndCol(n) {
    let row = Math.ceil(n / 8);
    let col = n % 8;
    if (col === 0) col = 8;
    return { row, col };
}
function inBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function getLegalMoves(board, row, col, enPassant = null) {
    const piece = getSquare(board, row, col);
    if (!piece) return [];

    const possibleMoves = allowedMoves(board, row, col, false, enPassant);
    let legalMoves = [];

    for (let move of possibleMoves) {
        const hypotheticalBoard = applyMove(board, { from: { row, col }, to: move });

        if (!isKingInCheck(hypotheticalBoard, piece.color, enPassant)) {
            legalMoves.push(move);
        }
    }

    return legalMoves;
}

function getSquare(board, row, col) {
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
    return board[row][col];
}

function findKing(board, color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = getSquare(board, row, col);

            if (piece && piece.color == color && piece.piece == "k") {
                return { row, col };
            }
        }
    }
}

function isKingInCheck(board, color, enPassant = null) {
    let kingLocation = findKing(board, color);
    if (!kingLocation) return false;

    let enemyColor = color === "white" ? "black" : "white";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = getSquare(board, row, col);

            if (!piece || piece.color !== enemyColor) continue;

            let moves = [];

            if (piece.piece === "p") {
                const direction = piece.color === "white" ? -1 : 1;
                moves.push({ row: row + direction, col: col - 1 }, { row: row + direction, col: col + 1 });
            } else {
                moves = allowedMoves(board, row, col, true, enPassant);
            }

            for (let move of moves) {
                if (move.row === kingLocation.row && move.col === kingLocation.col) {
                    return true;
                }
            }
        }
    }

    return false;
}

function hasAnyLegalMoves(board, color, enPassant = null) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = getSquare(board, row, col);

            if (!piece || piece.color !== color) continue;

            const moves = getLegalMoves(board, row, col, enPassant);

            if (moves.length > 0) return true;
        }
    }
    return false;
}

function rayCast(board, row, col, dr, dc, piece) {
    let moves = [];
    let i = 1;

    while (true) {
        let r = row + dr * i;
        let c = col + dc * i;

        if (r < 0 || r >= 8 || c < 0 || c >= 8) break;

        let target = getSquare(board, r, c);

        if (!target) {
            moves.push({ row: r, col: c });
        } else {
            if (target.color !== piece.color) {
                moves.push({ row: r, col: c });
            }
            break;
        }

        i++;
    }

    return moves;
}

function showLegalMoves(moves) {
    for (const move of moves) {
        let { row, col } = move;
        const selected = document.querySelectorAll(`[data-row="${row}"][data-col="${col}"]`);
        for (node of selected) {
            const dot = document.createElement("div");
            dot.className = "legalDot";
            node.appendChild(dot);
        }
    }
}

function highlightMoveSquare(row, col) {
    const target = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!target) return;
    target.classList.remove("movedTo");
    void target.offsetWidth;
    target.classList.add("movedTo");
}

function setThinkingState(thinking) {
    isBotThinking = thinking;
    const squares = document.querySelectorAll(".block");
    for (const square of squares) {
        if (thinking) {
            square.classList.add("thinking");
        } else {
            square.classList.remove("thinking");
        }
    }
}

function resetGame() {
    board = JSON.parse(JSON.stringify(startBoard));
    nextMoveColor = "white";
    selectedRow = null;
    selectedCol = null;
    isSelected = false;
    enPassantTarget = null;
    isBotThinking = false;

    setupBoard();
}

function getAllLegalMoves(board, color, enPassant = null) {
    let all_moves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col];

            if (piece && piece.color === color) {
                let piece_moves = getLegalMoves(board, row, col, enPassant);

                for (let move of piece_moves) {
                    all_moves.push({
                        from: { row, col },
                        to: move,
                    });
                }
            }
        }
    }

    return all_moves;
}

function evalBoard(board) {
    let pieceValues = {
        p: 100,
        n: 320,
        b: 330,
        r: 500,
        q: 900,
        k: 20000,
    };

    let totalEval = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let piece = board[row][col];

            if (!piece) continue;

            let value = pieceValues[piece.piece];

            if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
                value += 30;
            }

            if (row >= 2 && row <= 5 && col >= 2 && col <= 5) {
                value += 10;
            }

            if (piece.piece === "n") {
                if ((piece.color === "white" && row < 7) || (piece.color === "black" && row > 0)) {
                    value += 25;
                }
            }

            if (piece.piece === "b") {
                if ((piece.color === "white" && row < 7) || (piece.color === "black" && row > 0)) {
                    value += 20;
                }
            }

            let enemyColor = piece.color === "white" ? "black" : "white";

            if (isKingInCheck(board, enemyColor)) {
                value += 40;
            }

            if (piece.color === "white") {
                totalEval += value;
            } else {
                totalEval -= value;
            }
        }
    }

    return totalEval;
}

function applyMove(current_board, move) {
    let new_board = current_board.map((r) => r.map((sq) => (sq ? { ...sq } : null)));

    let start = move.from;
    let end = move.to;

    new_board[end.row][end.col] = new_board[start.row][start.col];
    new_board[start.row][start.col] = null;

    if (new_board[end.row][end.col]) {
        new_board[end.row][end.col].moved = true;
    }

    return new_board;
}

function minimax(current_board, depth, alpha, beta, color, enPassant = null) {
    const inCheck = isKingInCheck(current_board, color, enPassant);
    const hasMoves = hasAnyLegalMoves(current_board, color, enPassant);

    if (depth === 0 || !hasMoves) {
        let score = evalBoard(current_board);
        if (inCheck && !hasMoves) {
            score += color === "white" ? -9999 : 9999;
        }
        return { score, move: null };
    }

    if (color === "white") {
        let bestScore = -Infinity;
        let bestMove = null;

        for (let move of getAllLegalMoves(current_board, "white", enPassant)) {
            let result = minimax(applyMove(current_board, move), depth - 1, alpha, beta, "black", enPassant);

            if (result.score > bestScore) {
                bestScore = result.score;
                bestMove = move;
            }

            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }

        return { score: bestScore, move: bestMove };
    } else {
        let bestScore = Infinity;
        let bestMove = null;

        for (let move of getAllLegalMoves(current_board, "black", enPassant)) {
            let result = minimax(applyMove(current_board, move), depth - 1, alpha, beta, "white", enPassant);

            if (result.score < bestScore) {
                bestScore = result.score;
                bestMove = move;
            }

            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break;
        }

        return { score: bestScore, move: bestMove };
    }
}

function makeBotMove(current_board, color, depth, enPassant = null) {
    let result = minimax(current_board, depth, -Infinity, Infinity, color, enPassant);

    if (!result.move) return current_board;

    return applyMove(current_board, result.move);
}

function movePiece(row, col, element) {
    if (isBotThinking) return;
    const clickedPiece = getSquare(board, row, col);
    if (!clickedPiece && !isSelected) return;
    let didPlayerMove = false;

    if (isSelected == false) {
        if (!clickedPiece || clickedPiece.color !== nextMoveColor) return;
        setupBoard();

        const freshElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (clickedPiece) {
            selectedRow = row;
            selectedCol = col;
            isSelected = true;
            freshElement.style.backgroundColor = "green";
            moves = getLegalMoves(board, selectedRow, selectedCol, enPassantTarget);
            showLegalMoves(moves);
        }
        return;
    }

    const isLegal = moves.some((m) => m.row === row && m.col === col);

    if (isLegal) {
        const moveData = moves.find((m) => m.row === row && m.col === col);
        const movingPiece = board[selectedRow][selectedCol];

        if (moveData?.enPassant) {
            board[selectedRow][col] = null;
        }

        if (movingPiece.piece === "p" && Math.abs(row - selectedRow) === 2) {
            enPassantTarget = {
                row,
                col,
                color: movingPiece.color,
            };
        } else {
            enPassantTarget = null;
        }

        if (moveData?.castle) {
            if (moveData.castle === "kingside") {
                board[row][5] = board[row][7];
                board[row][7] = null;
                if (board[row][5]) board[row][5].moved = true;
            } else {
                board[row][3] = board[row][0];
                board[row][0] = null;
                if (board[row][3]) board[row][3].moved = true;
            }
        }

        board[row][col] = board[selectedRow][selectedCol];
        board[selectedRow][selectedCol] = null;

        if (board[row][col].piece === "p" && (row === 0 || row === 7)) {
            const choice = prompt("Promote to: q,r,b,n");
            const valid = ["q", "r", "b", "n"];
            board[row][col].piece = valid.includes(choice) ? choice : "q";
        }

        if (board[row][col]) {
            board[row][col].moved = true;
        }

        nextMoveColor = nextMoveColor === "white" ? "black" : "white";

        const inCheck = isKingInCheck(board, nextMoveColor, enPassantTarget);
        const hasMoves = hasAnyLegalMoves(board, nextMoveColor, enPassantTarget);

        setupBoard();

        const kingPos = findKing(board, nextMoveColor.toLowerCase());
        let kingObj = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);

        if (inCheck && !hasMoves) {
            console.log(nextMoveColor + " is in checkmate");
            kingObj.style.backgroundColor = "darkred";
            setTimeout(() => {
                alert(`${nextMoveColor == "white" ? "black" : "white"} won - ${nextMoveColor} is in checkmate`);
            }, 20);
            setTimeout(() => {
                const playAgain = confirm(`Play again?`);
                if (playAgain) resetGame();
            }, 30);
        } else if (inCheck) {
            console.log(nextMoveColor + " is in check");
            kingObj.style.backgroundColor = "red";
        } else if (!hasMoves) {
            console.log(nextMoveColor + " is in stalemate");
            setTimeout(() => {
                alert(`Draw - ${nextMoveColor} is in stalemate`);
            }, 20);
            setTimeout(() => {
                const playAgain = confirm(`Play again?`);
                if (playAgain) resetGame();
            }, 30);
        }
        didPlayerMove = true;
    }
    selectedRow = null;
    selectedCol = null;
    isSelected = false;
    if (!didPlayerMove) {
        setupBoard();
        return;
    }
    highlightMoveSquare(row, col);
    setThinkingState(true);

    setTimeout(() => {
        const botMoves = getAllLegalMoves(board, "black", enPassantTarget);
        const boardBeforeBot = board.map((r) => r.map((sq) => (sq ? { ...sq } : null)));
        const botResultBoard = makeBotMove(board, "black", 4, enPassantTarget);
        const didBotMove = botResultBoard !== board;
        board = botResultBoard;
        nextMoveColor = nextMoveColor === "white" ? "black" : "white";
        setupBoard();
        setThinkingState(false);

        if (didBotMove) {
            for (let m of botMoves) {
                const piece = getSquare(boardBeforeBot, m.from.row, m.from.col);
                if (!piece || piece.color !== "black") continue;
                if (board[m.to.row][m.to.col] && board[m.to.row][m.to.col].color === "black" && !board[m.from.row][m.from.col]) {
                    highlightMoveSquare(m.to.row, m.to.col);
                    break;
                }
            }
        }

        const inCheckAfterBot = isKingInCheck(board, nextMoveColor, enPassantTarget);
        const hasMovesAfterBot = hasAnyLegalMoves(board, nextMoveColor, enPassantTarget);
        const kingPosAfterBot = findKing(board, nextMoveColor.toLowerCase());
        const kingObjAfterBot = kingPosAfterBot ? document.querySelector(`[data-row="${kingPosAfterBot.row}"][data-col="${kingPosAfterBot.col}"]`) : null;

        if (inCheckAfterBot && !hasMovesAfterBot) {
            console.log(nextMoveColor + " is in checkmate");
            if (kingObjAfterBot) kingObjAfterBot.style.backgroundColor = "darkred";
            setTimeout(() => {
                alert(`${nextMoveColor == "white" ? "black" : "white"} won - ${nextMoveColor} is in checkmate`);
            }, 20);
            setTimeout(() => {
                const playAgain = confirm(`Play again?`);
                if (playAgain) resetGame();
            }, 30);
        } else if (inCheckAfterBot) {
            console.log(nextMoveColor + " is in check");
            if (kingObjAfterBot) kingObjAfterBot.style.backgroundColor = "red";
        } else if (!hasMovesAfterBot) {
            console.log(nextMoveColor + " is in stalemate");
            setTimeout(() => {
                alert(`Draw - ${nextMoveColor} is in stalemate`);
            }, 20);
            setTimeout(() => {
                const playAgain = confirm(`Play again?`);
                if (playAgain) resetGame();
            }, 30);
        }
    }, 380);
}

function allowedMoves(board, row, col, skipCastle = false, enPassant = null) {
    let legalMoves = [];
    let piece = getSquare(board, row, col);
    if (!piece) return [];

    let direction = piece.color === "white" ? -1 : 1;

    if (piece.piece && piece.piece === "p") {
        if (inBounds(row + direction, col) && !getSquare(board, row + direction, col)) {
            legalMoves.push({ row: row + direction, col: col });
        }

        const leftRow = row + direction;
        const leftCol = col - 1;
        const left = inBounds(leftRow, leftCol) ? getSquare(board, leftRow, leftCol) : null;
        if (left && left.color !== piece.color) {
            legalMoves.push({ row: row + direction, col: col - 1 });
        }

        const rightRow = row + direction;
        const rightCol = col + 1;
        const right = inBounds(rightRow, rightCol) ? getSquare(board, rightRow, rightCol) : null;
        if (right && right.color !== piece.color) {
            legalMoves.push({ row: row + direction, col: col + 1 });
        }

        if (
            enPassant &&
            enPassant.color !== piece.color &&
            row === enPassant.row &&
            Math.abs(col - enPassant.col) === 1 &&
            inBounds(row + direction, enPassant.col)
        ) {
            legalMoves.push({
                row: row + direction,
                col: enPassant.col,
                enPassant: true,
            });
        }

        if (!piece.moved) {
            if (
                inBounds(row + direction * 2, col) &&
                inBounds(row + direction, col) &&
                !getSquare(board, row + direction * 2, col) &&
                !getSquare(board, row + direction, col)
            ) {
                legalMoves.push({ row: row + direction * 2, col: col });
            }
        }
    }

    if (piece.piece === "n") {
        const moves = [
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1],
            [1, 2],
            [1, -2],
            [-1, 2],
            [-1, -2],
        ];

        for (let [dr, dc] of moves) {
            let r = row + dr;
            let c = col + dc;

            if (!inBounds(r, c)) continue;

            let target = getSquare(board, r, c);

            if (!target || target.color !== piece.color) {
                legalMoves.push({ row: r, col: c });
            }
        }
    }

    if (piece.piece === "k") {
        const moves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
        ];

        for (let [dr, dc] of moves) {
            let r = row + dr;
            let c = col + dc;

            if (!inBounds(r, c)) continue;

            let target = getSquare(board, r, c);

            if (!target || target.color !== piece.color) {
                legalMoves.push({ row: r, col: c });
            }
        }

        if (!skipCastle && !piece.moved && !isKingInCheck(board, piece.color, enPassant)) {
            const kRook = getSquare(board, row, 7);
            if (kRook && kRook.piece === "r" && !kRook.moved && !getSquare(board, row, 5) && !getSquare(board, row, 6)) {
                let temp = board.map((r) => r.map((sq) => (sq ? { ...sq } : null)));
                temp[row][5] = temp[row][col];
                temp[row][col] = null;

                if (!isKingInCheck(temp, piece.color, enPassant)) {
                    legalMoves.push({ row, col: 6, castle: "kingside" });
                }
            }

            const qRook = getSquare(board, row, 0);
            if (qRook && qRook.piece === "r" && !qRook.moved && !getSquare(board, row, 1) && !getSquare(board, row, 2) && !getSquare(board, row, 3)) {
                let temp = board.map((r) => r.map((sq) => (sq ? { ...sq } : null)));
                temp[row][3] = temp[row][col];
                temp[row][col] = null;

                if (!isKingInCheck(temp, piece.color, enPassant)) {
                    legalMoves.push({ row, col: 2, castle: "queenside" });
                }
            }
        }
    }

    if (piece.piece === "r") {
        let directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];
        for (let [dr, dc] of directions) {
            legalMoves.push(...rayCast(board, row, col, dr, dc, piece));
        }
    }

    if (piece.piece === "q") {
        let directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
            [1, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
        ];
        for (let [dr, dc] of directions) {
            legalMoves.push(...rayCast(board, row, col, dr, dc, piece));
        }
    }

    if (piece.piece === "b") {
        let directions = [
            [1, 1],
            [-1, -1],
            [1, -1],
            [-1, 1],
        ];
        for (let [dr, dc] of directions) {
            legalMoves.push(...rayCast(board, row, col, dr, dc, piece));
        }
    }

    return legalMoves;
}

function setupBoard() {
    gameCanvas.innerHTML = "";
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const element = document.createElement("div");

            element.className = "block";
            element.dataset.row = row;
            element.dataset.col = col;

            const currentPiece = board[row][col];
            if (currentPiece) {
                let key = currentPiece.color === "white" ? "w" + currentPiece.piece : currentPiece.piece;

                element.innerText = pieces[key];
            }

            const isBlack = (row + col) % 2 === 1;
            element.style.backgroundColor = isBlack ? "gray" : "white";
            element.onclick = () => movePiece(row, col, element);

            gameCanvas.appendChild(element);
        }
    }
}

setupBoard();
