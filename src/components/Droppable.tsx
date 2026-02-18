import { useContext } from 'react';
import DndContext from './DndContext';
import { setDroppableRef } from '../modules/useRefList';

type DroppableEvent = Record<string, never>;
type DroppableState = {
  isDraggingOver: boolean;
};

interface DroppableProps {
  areaId: string;
  children: (deliver: {
    event: DroppableEvent;
    deliverRef: (el: HTMLDivElement | null) => void;
    state: DroppableState;
  }) => React.ReactNode;
}

const Droppable = ({ areaId, children }: DroppableProps) => {
  const dndUtils = useContext(DndContext);
  if (!dndUtils) return null;

  const { getIsDraggingOver, droppableRefList } = dndUtils;

  const isDraggingOver = getIsDraggingOver(areaId);

  const deliver = {
    event: {},
    deliverRef: (el: HTMLDivElement | null) =>
      setDroppableRef(el, droppableRefList, areaId),
    state: { isDraggingOver },
  };

  return <>{children(deliver)}</>;
};

export default Droppable;
