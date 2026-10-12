import { useEffect, useRef, type ReactNode } from "react";
export function DemoDialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="dialog-root" onCancel={onClose}>
      {children}
    </dialog>
  );
}
