import React from "react";
import { useDroppable } from "@dnd-kit/core";

const CustomStyle = {
  display: "flex",
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  padding: "0 4px",
};

export function Droppable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={className}
      style={{ ...style, ...CustomStyle }}
    >
      {children}
    </div>
  );
}
