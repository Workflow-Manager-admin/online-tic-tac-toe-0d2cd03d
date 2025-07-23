import type { MetaFunction } from "@remix-run/node";
import React, { useState } from "react";

// PUBLIC_INTERFACE
export const meta: MetaFunction = () => [
  { title: "Tic Tac Toe" },
  {
    name: "description",
    content: "A minimalistic Tic Tac Toe browser game built with Remix",
  },
];

type Player = "X" | "O";
type Cell = Player | null;

const BOARD_SIZE = 3;

const COLORS = {
  primary: "#1E90FF", // Board border, current turn, X color
  accent: "#32CD32", // Winner indicator, O color
  secondary: "#FFFFFF", // Background
  cellHover: "#F0F8FF", // Very light blue
  border: "#E5E7EB",
  status: "#22223b",
};

/** Helper to calculate winner given a board state. */
function calculateWinner(board: Cell[][]): Player | null {
  // Rows
  for (let i = 0; i < BOARD_SIZE; i++) {
    if (
      board[i][0] &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2]
    ) {
      return board[i][0];
    }
  }
  // Columns
  for (let j = 0; j < BOARD_SIZE; j++) {
    if (
      board[0][j] &&
      board[0][j] === board[1][j] &&
      board[1][j] === board[2][j]
    ) {
      return board[0][j];
    }
  }
  // Diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return board[0][0];
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return board[0][2];

  return null;
}

// PUBLIC_INTERFACE
function getStatusText(
  winner: Player | null,
  board: Cell[][],
  currentPlayer: Player,
  isDraw: boolean
) {
  if (winner) return `Player ${winner} wins!`;
  if (isDraw) return "Draw!";
  return `Current turn: Player ${currentPlayer}`;
}

/** The main component for the game. */
export default function Index() {
  // Initialize state
  const [board, setBoard] = useState<Cell[][]>(
    Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  // Check for win/draw on move
  React.useEffect(() => {
    const win = calculateWinner(board);
    const moves = board.flat().filter(Boolean).length;
    if (win) {
      setWinner(win);
      setIsDraw(false);
      setTimeout(() => {
        setAlertShown(true);
      }, 250);
    } else if (moves === BOARD_SIZE * BOARD_SIZE) {
      setWinner(null);
      setIsDraw(true);
      setTimeout(() => {
        setAlertShown(true);
      }, 250);
    } else {
      setWinner(null);
      setIsDraw(false);
      setAlertShown(false);
    }
  }, [board]);

  const handleCellClick = (row: number, col: number) => {
    if (winner || isDraw) return;
    if (board[row][col]) return;
    setBoard((prev) => {
      const copy = prev.map((rowArr) => rowArr.slice());
      copy[row][col] = currentPlayer;
      return copy;
    });
    setCurrentPlayer((cur) => (cur === "X" ? "O" : "X"));
  };

  const handleRestart = () => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null)));
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
    setAlertShown(false);
  };

  // Render Board
  return (
    <main
      className="flex min-h-screen bg-white items-center justify-center"
      style={{ background: COLORS.secondary, fontFamily: "Inter, sans-serif" }}
    >
      <section className="w-full max-w-xs mx-auto flex flex-col items-center gap-8">
        {/* Status Panel */}
        <div
          className="mb-2 w-full text-center p-3 rounded-lg font-semibold"
          style={{
            background: "#F8FAFC",
            color:
              winner && winner === "X"
                ? COLORS.primary
                : winner && winner === "O"
                ? COLORS.accent
                : COLORS.status,
            fontSize: "1.35rem",
            minHeight: "2.7em",
            border: `1px solid ${COLORS.border}`,
          }}
          data-testid="status-panel"
        >
          {getStatusText(winner, board, currentPlayer, isDraw)}
        </div>

        {/* Tic Tac Toe Board */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 3.8rem)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, 3.8rem)`,
            gap: "0.35rem",
            background: COLORS.primary,
            borderRadius: "1rem",
            padding: "0.4rem",
            boxShadow: "0 2px 16px 0 rgba(30,144,255,0.09)",
          }}
          role="group"
          aria-label="Tic Tac Toe board"
          data-testid="tic-tac-toe-board"
        >
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                className="flex items-center justify-center text-2xl sm:text-3xl font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-300 transition hover:bg-[#F0F8FF] select-none"
                tabIndex={0}
                aria-label={
                  cell
                    ? `Cell ${rowIdx + 1}, ${colIdx + 1}, filled ${cell}`
                    : `Cell ${rowIdx + 1}, ${colIdx + 1}, empty`
                }
                disabled={!!cell || winner || isDraw}
                style={{
                  background: COLORS.secondary,
                  borderRadius: "0.65rem",
                  height: "3.8rem",
                  width: "3.8rem",
                  color:
                    cell === "X"
                      ? COLORS.primary
                      : cell === "O"
                      ? COLORS.accent
                      : "#888",
                  border:
                    cell || winner || isDraw
                      ? `1.5px solid ${COLORS.border}`
                      : "1.5px solid #E0E7FF",
                  cursor:
                    cell || winner || isDraw
                      ? "default"
                      : "pointer",
                  transition: "background 0.12s",
                  fontSize: "2.2rem",
                  willChange: "background, color",
                  outline: "none",
                }}
                data-testid={`cell-${rowIdx}-${colIdx}`}
              >
                {cell}
              </button>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 w-full mt-1">
          <button
            className="w-full py-2 rounded-lg font-bold shadow-md"
            style={{
              background: COLORS.primary,
              color: "#FFF",
              fontSize: "1.1rem",
              border: "none",
              outline: "none",
              transition: "box-shadow 0.12s, background 0.15s",
              boxShadow: "0 1.5px 10px 0 rgba(30,144,255,0.11)",
            }}
            onClick={handleRestart}
            data-testid="restart-btn"
          >
            {board.flat().some(Boolean) || winner || isDraw ? "Restart Game" : "Start New Game"}
          </button>
        </div>

        {/* Alert on win/draw */}
        {alertShown && (winner || isDraw) && (
          <button
            type="button"
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-50"
            style={{ backdropFilter: "blur(2px)", padding: 0, border: "none", margin: 0, background: "rgba(0,0,0,0.3)" }}
            aria-live="assertive"
            data-testid="result-modal"
            aria-label="Close result dialog"
            onClick={() => setAlertShown(false)}
          >
            {/* Modal content */}
            <div
              className="bg-white rounded-xl shadow-lg px-7 py-6 flex flex-col items-center gap-3 relative"
              style={{
                minWidth: "17em",
                border: `2.5px solid ${
                  winner === "X"
                    ? COLORS.primary
                    : winner === "O"
                    ? COLORS.accent
                    : "#95a5a6"
                }`,
              }}
              role="alertdialog"
              aria-modal="true"
              aria-label={winner ? `Player ${winner} wins!` : "It's a draw!"}
            >
              <span
                className="text-2xl font-bold"
                style={{
                  color:
                    winner === "X"
                      ? COLORS.primary
                      : winner === "O"
                      ? COLORS.accent
                      : "#444",
                }}
              >
                {winner
                  ? `🎉 Player ${winner} wins!`
                  : "🤝 It's a draw!"}
              </span>
              <button
                onClick={() => {
                  setAlertShown(false);
                  handleRestart();
                }}
                className="mt-3 px-5 py-2 rounded-lg font-semibold border-none"
                style={{
                  background:
                    winner === "X"
                      ? COLORS.primary
                      : winner === "O"
                      ? COLORS.accent
                      : COLORS.primary,
                  color: "#FFF",
                  fontSize: "1rem",
                  boxShadow: "0 1px 7px 0 rgba(30,144,255,0.11)",
                  cursor: "pointer",
                }}
                data-testid="modal-restart-btn"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={() => setAlertShown(false)}
                aria-label="Close"
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>
          </button>
        )}
      </section>
    </main>
  );
}
