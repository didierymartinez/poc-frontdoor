import { useState } from 'react';

interface AnchorState {
  el: HTMLElement;
  rowId: number;
  base: number;
  existingTipos: string[];
}

interface MenuAnchorState {
  el: HTMLElement;
  rowId: number;
  base: number;
  row: { impuestos: { tipo: string }[]; retenciones: { tipo: string }[] };
}

export function useFiscalPopoverAnchors() {
  const [taxAnchor, setTaxAnchor] = useState<AnchorState | null>(null);
  const [retAnchor, setRetAnchor] = useState<AnchorState | null>(null);
  const [newRowTaxAnchor, setNewRowTaxAnchor] = useState<HTMLElement | null>(null);
  const [newRowRetAnchor, setNewRowRetAnchor] = useState<HTMLElement | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<MenuAnchorState | null>(null);
  const [newRowMenuAnchor, setNewRowMenuAnchor] = useState<HTMLElement | null>(null);

  return {
    taxAnchor, setTaxAnchor,
    retAnchor, setRetAnchor,
    newRowTaxAnchor, setNewRowTaxAnchor,
    newRowRetAnchor, setNewRowRetAnchor,
    addMenuAnchor, setAddMenuAnchor,
    newRowMenuAnchor, setNewRowMenuAnchor,
  };
}
