import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { ReactNode } from "react";

interface SortableCardProps {
  id: string;
  children: ReactNode;
}

const SortableCard = ({ id, children }: SortableCardProps) => {
  const draggable = useDraggable({ id });
  const { attributes, listeners, setNodeRef, transform } = draggable;
  // Some versions of dnd-kit do not provide 'transition' from useDraggable
  const transition = (draggable as any).transition || undefined;

  // Ensure x and y are always numbers (default to 0 if undefined)
  const adjustedTransform = {
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    scaleX: 1,
    scaleY: 1,
  };

  const style = {
    transform: CSS?.Transform?.toString(adjustedTransform),
    ...(transition ? { transition } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      tabIndex={-1}
      className="sortable-item"
    >
      {children}
    </div>
  );
};

export default SortableCard;
