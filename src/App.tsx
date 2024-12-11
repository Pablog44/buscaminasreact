import React, { useState } from "react";
import Board from "./Board.tsx";


const difficulties = [
  { name: "Fácil (8x8, 10 minas)", rows: 8, cols: 8, mines: 10 },
  { name: "Medio (16x16, 40 minas)", rows: 16, cols: 16, mines: 40 },
  { name: "Difícil (16x30, 99 minas)", rows: 16, cols: 30, mines: 99 },
];

function App() {
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [gameKey, setGameKey] = useState(0);

  const resetGame = () => {
    setGameKey((prevKey) => prevKey + 1);
  };

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Buscaminas Mejorado</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
        <span style={{ fontWeight: "bold" }}>Dificultad:</span>
        <select
          value={difficulty.name}
          onChange={(e) => {
            const diff = difficulties.find((d) => d.name === e.target.value);
            if (diff) setDifficulty(diff);
          }}
          style={{ padding: "4px", borderRadius: "4px" }}
        >
          {difficulties.map((diff) => (
            <option key={diff.name} value={diff.name}>
              {diff.name}
            </option>
          ))}
        </select>

        <button
          onClick={resetGame}
          style={{ padding: "8px 16px", backgroundColor: "green", color: "white", borderRadius: "4px" }}
        >
          Reiniciar Juego
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <Board
          key={gameKey}
          rows={difficulty.rows}
          cols={difficulty.cols}
          mines={difficulty.mines}
        />
      </div>
    </div>
  );
}

export default App;
