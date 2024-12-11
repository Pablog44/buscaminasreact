import React, { useState } from "react";

// Tipos
type Cell = {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  neighborCount: number;
};

type BoardProps = {
  rows: number;
  cols: number;
  mines: number;
};

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const generateEmptyBoard = (rows: number, cols: number): Cell[][] => {
  return Array(rows)
    .fill(null)
    .map(() =>
      Array(cols)
        .fill(null)
        .map(() => ({
          isMine: false,
          revealed: false,
          flagged: false,
          neighborCount: 0,
        }))
    );
};

// Genera el tablero con minas, asegurando que la primera celda revelada sea segura.
const generateBoardWithMines = (
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Cell[][] => {
  const board = generateEmptyBoard(rows, cols);

  // Evitar poner minas en safeRow, safeCol y en sus vecinos
  const safePositions = new Set<string>();
  directions.concat([[0, 0]]).forEach(([dr, dc]) => {
    const nr = safeRow + dr;
    const nc = safeCol + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      safePositions.add(`${nr},${nc}`);
    }
  });

  let placedMines = 0;
  while (placedMines < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    const key = `${row},${col}`;
    if (!board[row][col].isMine && !safePositions.has(key)) {
      board[row][col].isMine = true;
      placedMines++;
    }
  }

  // Calculamos conteos vecinos
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        directions.forEach(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            board[nr][nc].isMine
          ) {
            count++;
          }
        });
        board[r][c].neighborCount = count;
      }
    }
  }

  return board;
};

const revealCells = (board: Cell[][], row: number, col: number): Cell[][] => {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const stack: [number, number][] = [[row, col]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    if (newBoard[r][c].revealed || newBoard[r][c].flagged) continue;
    newBoard[r][c].revealed = true;

    // Si no tiene minas alrededor, revelar en cascada
    if (newBoard[r][c].neighborCount === 0) {
      directions.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < newBoard.length &&
          nc >= 0 &&
          nc < newBoard[0].length &&
          !newBoard[nr][nc].revealed &&
          !newBoard[nr][nc].flagged
        ) {
          stack.push([nr, nc]);
        }
      });
    }
  }

  return newBoard;
};

// "Chord": si la celda clickeada es un número ya revelado, y el número de banderas alrededor
// coincide con ese número, se revelan las celdas ocultas vecinas.
const chord = (board: Cell[][], row: number, col: number): Cell[][] => {
  const newBoard = board.map((r) => r.map((cell) => ({ ...cell })));
  const cell = newBoard[row][col];
  if (!cell.revealed || cell.flagged || cell.isMine || cell.neighborCount === 0)
    return newBoard;

  let flaggedCount = 0;
  let hiddenNeighbors: [number, number][] = [];

  directions.forEach(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < newBoard.length && nc >= 0 && nc < newBoard[0].length) {
      if (newBoard[nr][nc].flagged) flaggedCount++;
      else if (!newBoard[nr][nc].revealed) hiddenNeighbors.push([nr, nc]);
    }
  });

  if (flaggedCount === cell.neighborCount) {
    hiddenNeighbors.forEach(([nr, nc]) => {
      if (newBoard[nr][nc].isMine) {
        // Game Over
        revealAllMines(newBoard);
      } else {
        Object.assign(newBoard, revealCells(newBoard, nr, nc));
      }
    });
  }

  return newBoard;
};

const revealAllMines = (board: Cell[][]) => {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c].isMine) {
        board[r][c].revealed = true;
      }
    }
  }
};

const checkWin = (board: Cell[][]): boolean => {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c];
      if (!cell.isMine && !cell.revealed) {
        return false;
      }
    }
  }
  return true;
};

const Board: React.FC<BoardProps> = ({ rows, cols, mines }) => {
  const [board, setBoard] = useState<Cell[][]>(() => generateEmptyBoard(rows, cols));
  const [gameOver, setGameOver] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [win, setWin] = useState(false);

  const handleLeftClick = (row: number, col: number) => {
    if (gameOver || win) return;
    const cell = board[row][col];

    // Si es el primer click, generamos las minas asegurando casilla segura
    if (firstClick) {
      const newBoard = generateBoardWithMines(rows, cols, mines, row, col);
      const revealedBoard = revealCells(newBoard, row, col);
      setBoard(revealedBoard);
      setFirstClick(false);
      return;
    }

    if (cell.flagged || cell.revealed) {
      // Si la celda ya está revelada y tiene número, aplicamos "chord"
      if (cell.revealed && !cell.isMine && cell.neighborCount > 0) {
        const newBoard = chord(board, row, col);
        setBoard(newBoard);
        if (checkWin(newBoard)) {
          setWin(true);
        }
      }
      return;
    }

    if (cell.isMine) {
      // Game Over
      const newBoard = board.map((r) => r.map((c) => ({ ...c })));
      revealAllMines(newBoard);
      setBoard(newBoard);
      setGameOver(true);
      return;
    }

    // Revelar celda(s)
    const revealedBoard = revealCells(board, row, col);
    setBoard(revealedBoard);
    if (checkWin(revealedBoard)) {
      setWin(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || win) return;
    const cell = board[row][col];
    if (cell.revealed) return;

    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
    setBoard(newBoard);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {gameOver && (
        <div style={{ marginBottom: "8px", color: "red", fontWeight: "bold" }}>
          ¡Boom! Perdiste.
        </div>
      )}
      {win && (
        <div style={{ marginBottom: "8px", color: "green", fontWeight: "bold" }}>
          ¡Ganaste!
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 32px)`,
          gap: "2px",
          backgroundColor: "#000",
          padding: "2px",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            let cellContent = "";
            let cellStyle: React.CSSProperties = {
              width: "32px",
              height: "32px",
              border: "1px solid #555",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: "bold",
              userSelect: "none",
              boxSizing: "border-box",
            };

            if (cell.revealed) {
              if (cell.isMine) {
                cellContent = "💣";
                cellStyle.backgroundColor = "red";
                cellStyle.color = "white";
              } else {
                cellStyle.backgroundColor = "#ccc";
                if (cell.neighborCount > 0) {
                  cellContent = cell.neighborCount.toString();
                  cellStyle.color = "blue";
                }
              }
            } else {
              if (cell.flagged) {
                cellContent = "🚩";
                cellStyle.backgroundColor = "yellow";
              } else {
                cellStyle.backgroundColor = "#777";
                cellStyle.cursor = "pointer";
              }
            }

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleLeftClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                style={cellStyle}
              >
                {cellContent}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
