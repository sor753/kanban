import { createContext } from 'react';

const DndContext = createContext<{
  draggableRefList: React.RefObject<
    ({
      areaId: string;
      index: number;
      el: HTMLDivElement | null;
    } | null)[]
  >;
  droppableRefList: React.RefObject<
    ({
      areaId: string;
      el: HTMLDivElement | null;
    } | null)[]
  >;
  getIsDragging: (areaId: string, index: number) => boolean;
  getIsDraggingOver: (areaId: string) => boolean;
  draggableEvent: {
    handleDragStart: (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      index: number,
      areaId: string,
    ) => void;
    handleDrag: (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      index: number,
      areaId: string,
    ) => void;
    handleDragEnd: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    handleDragLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  };
  droppableEvent: {
    handleDropEnter: (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
      areaId?: string,
    ) => void;
    hadleDropLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  };
} | null>(null);

export default DndContext;
