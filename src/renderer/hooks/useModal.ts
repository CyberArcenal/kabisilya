// hooks/useModal.ts
import { useState, useCallback } from "react";

interface UseModalReturn {
  isOpen: boolean;
  selectedId: number | undefined;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelected: (selectedId: number) => void;
}

export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [selectedId, setSelectedId] = useState<number | undefined>();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const setSelected = useCallback(
    (selectedId: number) => setSelectedId(selectedId),
    [],
  );

  return { isOpen, selectedId, open, close, toggle, setSelected };
};
