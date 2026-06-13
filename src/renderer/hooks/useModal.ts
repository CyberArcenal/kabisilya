// hooks/useModal.ts
import { useState, useCallback } from "react";

interface UseModalReturn {
  isOpen: boolean;
  selectedId: number | undefined;
  initialData: any | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelected: (selectedId: number) => void;
  setInitial: (initial:any) => void;
}

export const useModal = (initialState = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [initialData, setInitialData] = useState<any|null>();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const setSelected = useCallback(
    (selectedId: number) => setSelectedId(selectedId),
    [],
  );
  const setInitial = useCallback((initial:any) => setInitialData(initial), []);

  return { isOpen, selectedId, initialData, open, close, toggle, setSelected, setInitial };
};
