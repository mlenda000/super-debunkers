import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { SortableCardProps } from "@/types/types";

const SortableCard = ({ id, children }: SortableCardProps) => {
  const draggable = useDraggable({ id });
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    draggable;
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
    // Ensure dragged items appear above everything else
    zIndex: transform ? 1000 : 1,
  };

  // Only apply drag listeners on desktop (where drag and drop is useful)
  // On mobile/touch, let the card's own touch handlers work
  const isTouchDevice = "ontouchstart" in window;
  const dragListeners = isTouchDevice ? {} : listeners;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragListeners}
      {...attributes}
      tabIndex={-1}
      className="sortable-item"
      aria-grabbed={isDragging}
      aria-describedby="dnd-instructions"
    >
      {children}
    </div>
  );
};

export default SortableCard;
