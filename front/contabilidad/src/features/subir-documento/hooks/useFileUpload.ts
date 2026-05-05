import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ACCEPTED_TYPES = 'application/pdf,image/png,image/jpeg,image/jpg,image/webp';

export function useFileUpload() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = useCallback(() => {
    // Create a hidden file input on the fly
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = ACCEPTED_TYPES;
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (file) {
          navigate('/registro-ocr', { state: { pendingFile: file } });
        }
        // Reset so same file can be selected again
        input.value = '';
      });
      document.body.appendChild(input);
      inputRef.current = input;
    }
    inputRef.current.click();
  }, [navigate]);

  return { openFilePicker };
}
