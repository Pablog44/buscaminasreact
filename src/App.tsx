import React, { useState } from "react";
import Board from "./Board.tsx";
import { Listbox } from "@headlessui/react";

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
    <div className="p-4 flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-bold">Buscaminas Mejorado</h1>

      <div className="flex space-x-2 items-center">
        <span className="font-medium">Dificultad:</span>
        <Listbox value={difficulty} onChange={setDifficulty}>
          <Listbox.Button className="px-4 py-2 bg-blue-500 text-white rounded">
            {difficulty.name}
          </Listbox.Button>
          <Listbox.Options className="absolute mt-1 bg-white border border-gray-300 rounded shadow-lg">
            {difficulties.map((diff) => (
              <Listbox.Option key={diff.name} value={diff}>
                {({ selected, active }) => (
                  <div
                    className={`px-4 py-2 cursor-pointer ${
                      active ? "bg-blue-100" : ""
                    } ${selected ? "font-bold" : ""}`}
                  >
                    {diff.name}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>

        <button
          onClick={() => {
            resetGame();
          }}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Reiniciar Juego
        </button>
      </div>

      <Board
        key={gameKey}
        rows={difficulty.rows}
        cols={difficulty.cols}
        mines={difficulty.mines}
      />
    </div>
  );
}

export default App;
