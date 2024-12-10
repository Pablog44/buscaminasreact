import React from "react";
import { Dialog } from "@headlessui/react";

const VictoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-4 rounded shadow">
          <Dialog.Title>¡Ganaste!</Dialog.Title>
          <button onClick={onClose} className="mt-4 bg-blue-500 text-white py-1 px-2 rounded">
            Cerrar
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default VictoryModal;
