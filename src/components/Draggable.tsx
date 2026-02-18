import { useContext } from 'react';
import DndContext from './DndContext';
import { setDraggableRef } from '../modules/useRefList';

type DraggableAttribute = {
  draggable: boolean;
};
type DraggableEvent = {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};
type DraggableState = {
  isDragging: boolean;
};

interface DraggableProps {
  areaId: string;
  index: number;
  children: (deliver: {
    event: DraggableEvent;
    attribute: DraggableAttribute;
    deliverRef: (el: HTMLDivElement | null) => void;
    state: DraggableState;
  }) => React.ReactNode;
}

const Draggable = ({ children, areaId, index }: DraggableProps) => {
  const dndUtils = useContext(DndContext);
  if (!dndUtils) return null;

  const { getIsDragging, draggableRefList, draggableEvent } = dndUtils;

  const isDragging = getIsDragging(areaId, index);

  const deliver = {
    event: {
      onMouseDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        draggableEvent.handleDragStart(e, index, areaId),
      onMouseMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        draggableEvent.handleDrag(e, index, areaId),
      onMouseUp: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        draggableEvent.handleDragEnd(e),
      onMouseLeave: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        draggableEvent.handleDragLeave(e),
    },
    attribute: {
      draggable: false,
    },
    deliverRef: (el: HTMLDivElement | null) =>
      setDraggableRef(el, draggableRefList, areaId, index),
    state: { isDragging },
  };

  return (
    <div className={isDragging ? 'draggable-cursor' : 'grab'}>
      {children(deliver)}
    </div>
  );
};

export default Draggable;
