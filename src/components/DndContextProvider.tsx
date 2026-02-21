import { useCallback, useEffect, useState } from 'react';
import DndContext from './DndContext';
import {
  useDraggableRefList,
  useDroppableRefList,
} from '../modules/useRefList';

interface DndContextProviderProps {
  children: React.ReactNode;
  onDragEnd: (result: {
    dragStart: {
      index: number;
      areaId: string;
    } | null;
    dragEnd: {
      index: number;
      areaId: string;
    } | null;
  }) => void;
}
const DndContextProvider = ({
  children,
  onDragEnd,
}: DndContextProviderProps) => {
  const draggableRefList = useDraggableRefList<HTMLDivElement>();
  const [isDraggingInfo, setIsDraggingInfo] = useState<{
    index: number;
    areaId: string;
    isDragging: boolean;
  }>();

  const getIsDragging = useCallback(
    (areaId: string, index: number) => {
      if (!isDraggingInfo) return false;
      return isDraggingInfo.areaId === areaId && isDraggingInfo.index === index;
    },
    [isDraggingInfo],
  );

  const [dragStart, setDragStart] = useState<{
    index: number;
    areaId: string;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{
    index: number;
    areaId: string;
  } | null>(null);

  const droppableRefList = useDroppableRefList<HTMLDivElement>();
  const [dragArea, setDragArea] = useState<string>();
  const getIsDraggingOver = (areaId: string) => {
    if (!dragArea) return false;
    return dragArea === areaId;
  };

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draggingSize, setDraggingSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // draggable events >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // dragstart: ドラッグの開始
  // e.dataTransferの代わりにuseStateを使用すると、より多くのデータを転送できます。
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    areaId: string,
  ) => {
    setIsDraggingInfo({ index, areaId, isDragging: true });
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragStart({ index, areaId });
    const currentHeight = e.currentTarget.offsetHeight;
    const currentWidth = e.currentTarget.offsetWidth;
    setDraggingSize({ width: currentWidth, height: currentHeight });
    // const ghostElement = e.currentTarget.cloneNode(true) as HTMLDivElement;
    // ghostElement.style.opacity = '0';
    // document.body.appendChild(ghostElement);
    e.currentTarget.style.width = `${currentWidth}px`;
    e.currentTarget.style.height = `${currentHeight}px`;
    e.currentTarget.style.position = 'fixed';
    e.currentTarget.style.zIndex = '1000';
    e.currentTarget.style.opacity = '0.8';
    e.currentTarget.style.transition = 'opacity 0.2s ease';
    // e.currentTarget.style.pointerEvents = 'none';
    // e.dataTransfer.setDragImage(ghostElement, 0, 0); // ドラッグ中のデフォルトのイメージを消す
  };

  const handleDrag = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    areaId: string,
  ) => {
    if (!getIsDragging(areaId, index)) return;
    if (startPos) {
      const distanceX = e.clientX - startPos.x;
      const distanceY = e.clientY - startPos.y;
      e.currentTarget.style.transform = `translate(${distanceX}px, ${distanceY}px)`;

      // ドラッグ中の要素の現在の矩形を取得
      const dragRect = e.currentTarget.getBoundingClientRect();

      // ドロップ可能な要素との重なり判定
      let overlappingAreaId: string | undefined;
      if (droppableRefList.current) {
        for (const droppableRef of droppableRefList.current) {
          if (!droppableRef?.el) continue;
          const dropRect = droppableRef.el.getBoundingClientRect();

          // 矩形同士が重なっているかを判定
          const isOverlapping =
            dragRect.left < dropRect.right &&
            dragRect.right > dropRect.left &&
            dragRect.top < dropRect.bottom &&
            dragRect.bottom > dropRect.top;

          if (isOverlapping) {
            overlappingAreaId = droppableRef.areaId;
            break;
          }
        }
      }

      // 重なっている要素が変わった場合のみ更新
      setDragArea(overlappingAreaId);

      // ドロップ要素内のドラッグ可能要素との重なり判定
      let maxOverlapRatio = 0;
      let targetIndex: number | null = null;
      let lastAreaIndex: number | null = null;
      let lastAreaBottom: number | null = null;

      if (overlappingAreaId && draggableRefList.current) {
        for (const draggableRef of draggableRefList.current) {
          if (!draggableRef?.el) continue;
          // 同じドロップ要素内で、ドラッグ要素自身を除く
          if (
            draggableRef.areaId !== overlappingAreaId ||
            draggableRef.index === index
          ) {
            continue;
          }

          if (lastAreaIndex === null || draggableRef.index > lastAreaIndex) {
            lastAreaIndex = draggableRef.index;
            lastAreaBottom = draggableRef.el.getBoundingClientRect().bottom;
          }

          const otherRect = draggableRef.el.getBoundingClientRect();

          const shouldExpandGap =
            !!draggingSize &&
            !!dragStart &&
            !!dragEnd &&
            dragEnd.areaId === overlappingAreaId &&
            draggableRef.areaId === dragEnd.areaId &&
            draggableRef.index >= dragEnd.index &&
            !(
              draggableRef.areaId === dragStart.areaId &&
              draggableRef.index === dragStart.index
            );

          const otherRectTop = shouldExpandGap
            ? otherRect.top - draggingSize.height
            : otherRect.top;
          const otherRectBottom = otherRect.bottom;
          const otherRectLeft = otherRect.left;
          const otherRectRight = otherRect.right;

          // 重なり矩形を計算
          const overlapLeft = Math.max(dragRect.left, otherRectLeft);
          const overlapTop = Math.max(dragRect.top, otherRectTop);
          const overlapRight = Math.min(dragRect.right, otherRectRight);
          const overlapBottom = Math.min(dragRect.bottom, otherRectBottom);

          const overlapWidth = Math.max(0, overlapRight - overlapLeft);
          const overlapHeight = Math.max(0, overlapBottom - overlapTop);
          const overlapArea = overlapWidth * overlapHeight;

          const otherWidth = otherRectRight - otherRectLeft;
          const otherHeight = otherRectBottom - otherRectTop;
          const overlapRatio =
            otherHeight > 0 && otherWidth > 0
              ? overlapArea / (otherWidth * otherHeight)
              : 0;

          if (overlapArea > 0 && overlapRatio > maxOverlapRatio) {
            maxOverlapRatio = overlapRatio;
            const overlapCenterY = (overlapTop + overlapBottom) / 2;
            const otherCenterY = (otherRectTop + otherRectBottom) / 2;

            // Yの上半分に重なっていたらYのindexの1つ前、下半分なら1つ後
            if (overlapCenterY < otherCenterY) {
              targetIndex = draggableRef.index;
            } else {
              targetIndex = draggableRef.index + 1;
            }
          }
        }
      }

      // dragEndを設定
      const resolvedAreaId = overlappingAreaId || areaId;
      if (
        resolvedAreaId === overlappingAreaId &&
        lastAreaIndex !== null &&
        lastAreaBottom !== null &&
        dragRect.top > lastAreaBottom
      ) {
        setDragEnd({ index: lastAreaIndex + 1, areaId: resolvedAreaId });
        return;
      }
      if (targetIndex === null) {
        if (resolvedAreaId === overlappingAreaId && lastAreaIndex === null) {
          setDragEnd({ index: 0, areaId: resolvedAreaId });
          return;
        }
        setDragEnd({ index, areaId: resolvedAreaId });
        return;
      }
      let resolvedIndex = targetIndex;
      if (resolvedAreaId === areaId) {
        if (index < targetIndex) {
          resolvedIndex = targetIndex - 1;
        }
      }
      setDragEnd({ index: resolvedIndex, areaId: resolvedAreaId });
    }
  };

  const handleDragLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.currentTarget.style.left = '';
    e.currentTarget.style.top = '';
    e.currentTarget.style.width = '';
    e.currentTarget.style.height = '';
    e.currentTarget.style.position = '';
    e.currentTarget.style.transform = '';
    setIsDraggingInfo(undefined);
    setDragStart(null);
    setDragEnd(null);
    setStartPos(null);
    setDraggingSize(null);
    setDragArea(undefined);
  };

  // drop: ドラッグ要素がドロップ要素上にドロップされたとき
  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.currentTarget.style.left = '';
    e.currentTarget.style.top = '';
    e.currentTarget.style.width = '';
    e.currentTarget.style.height = '';
    e.currentTarget.style.position = '';
    e.currentTarget.style.transform = '';

    if (!dragArea) {
      setIsDraggingInfo(undefined);
      setDragStart(null);
      setDragEnd(null);
      setStartPos(null);
      setDraggingSize(null);
      setDragArea(undefined);
      return;
    }

    onDragEnd({ dragStart, dragEnd });

    setIsDraggingInfo(undefined);
    setDragStart(null);
    setDragEnd(null);
    setStartPos(null);
    setDraggingSize(null);
    setDragArea(undefined);
  };
  // draggable events <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  useEffect(() => {
    if (!draggableRefList.current) return;
    if (!dragStart) {
      draggableRefList.current.forEach((ref) => {
        if (!ref?.el) return;
        ref.el.style.transform = '';
      });
      return;
    }
    if (!dragEnd) return;

    const currentDraggable = draggableRefList.current.filter(
      (ref) => ref?.areaId === dragEnd.areaId,
    );
    if (currentDraggable.length === 0) return;
    currentDraggable.forEach((ref) => {
      if (!ref?.el) return;
      if (ref.areaId === dragStart.areaId && ref.index === dragStart.index)
        return;
      if (ref.index < dragEnd.index) {
        ref.el.style.transform = ``;
        return;
      }
      ref.el.style.transform = `translateY(${ref.el.offsetHeight}px)`;
    });
    const otherDraggables = draggableRefList.current.filter(
      (ref) => ref?.areaId !== dragEnd.areaId,
    );
    if (otherDraggables.length === 0) return;
    otherDraggables.forEach((ref) => {
      if (!ref?.el) return;
      if (ref.areaId === dragStart.areaId && ref.index === dragStart.index)
        return;
      ref.el.style.transform = ``;
    });
  }, [draggableRefList, dragStart, dragEnd]);

  return (
    <DndContext.Provider
      value={{
        draggableRefList,
        droppableRefList,
        getIsDragging,
        getIsDraggingOver,
        draggableEvent: {
          handleDragStart,
          handleDrag,
          handleDragEnd,
          handleDragLeave,
        },
      }}
    >
      {children}
    </DndContext.Provider>
  );
};

export default DndContextProvider;
