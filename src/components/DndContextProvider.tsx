import { useCallback, useEffect, useRef, useState } from 'react';
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
  const getIsDraggingOver = useCallback(
    (areaId: string) => {
      if (!dragArea) return false;
      return dragArea === areaId;
    },
    [dragArea],
  );

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [draggingSize, setDraggingSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const dragFrameRequestId = useRef<number | null>(null);
  const latestDrag = useRef<{
    clientX: number;
    clientY: number;
    target: HTMLDivElement;
    index: number;
    areaId: string;
  } | null>(null);

  // 全ドラッグ要素のインラインスタイルを初期化
  // ドラッグ終了時に残る transform などを確実にリセットする
  const resetAllDraggableStyles = () => {
    if (!draggableRefList.current) return;
    draggableRefList.current.forEach((ref) => {
      if (!ref?.el) return;
      ref.el.style.left = '';
      ref.el.style.top = '';
      ref.el.style.width = '';
      ref.el.style.height = '';
      ref.el.style.position = '';
      ref.el.style.transform = '';
      ref.el.style.transition = '';
      ref.el.style.opacity = '';
      ref.el.style.zIndex = '';
    });
  };

  const getOverlappingAreaId = (dragRect: DOMRect) => {
    if (!droppableRefList.current) return undefined;

    for (const droppableRef of droppableRefList.current) {
      if (!droppableRef?.el) continue;
      const dropRect = droppableRef.el.getBoundingClientRect();

      const isOverlapping =
        dragRect.left < dropRect.right &&
        dragRect.right > dropRect.left &&
        dragRect.top < dropRect.bottom &&
        dragRect.bottom > dropRect.top;

      if (isOverlapping) return droppableRef.areaId;
    }

    return undefined;
  };

  const resolveDragEnd = (params: {
    dragRect: DOMRect;
    areaId: string;
    index: number;
    overlappingAreaId: string | undefined;
  }) => {
    const { dragRect, areaId, index, overlappingAreaId } = params;

    if (!draggableRefList.current) {
      return { index, areaId: overlappingAreaId || areaId };
    }

    let maxOverlapRatio = 0;
    let targetIndex: number | null = null;
    let lastAreaIndex: number | null = null;
    let lastAreaBottom: number | null = null;

    if (overlappingAreaId) {
      for (const draggableRef of draggableRefList.current) {
        if (!draggableRef?.el) continue;
        if (
          draggableRef.areaId !== overlappingAreaId ||
          draggableRef.index === index
        ) {
          continue;
        }

        // エリア内の最後の要素の index / bottom を保持
        if (lastAreaIndex === null || draggableRef.index > lastAreaIndex) {
          lastAreaIndex = draggableRef.index;
          lastAreaBottom = draggableRef.el.getBoundingClientRect().bottom;
        }

        const otherRect = draggableRef.el.getBoundingClientRect();

        // 既に空けている隙間（ドラッグ要素の高さ）も重なり判定に含める
        // これにより「隙間の上」でも重なり判定が成立する
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

        // 最も重なり率が高い要素をターゲットにする
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

    // dragEndを設定（ここで並び替え先の index が決まる）
    const resolvedAreaId = overlappingAreaId || areaId;
    if (
      resolvedAreaId === overlappingAreaId &&
      lastAreaIndex !== null &&
      lastAreaBottom !== null &&
      dragRect.top > lastAreaBottom
    ) {
      // 最下段より下なら末尾に挿入
      return { index: lastAreaIndex + 1, areaId: resolvedAreaId };
    }
    if (targetIndex === null) {
      if (resolvedAreaId === overlappingAreaId && lastAreaIndex === null) {
        // エリアが空なら先頭に挿入
        return { index: 0, areaId: resolvedAreaId };
      }
      // 明確な重なりが無い場合は現在の index を維持
      return { index, areaId: resolvedAreaId };
    }
    let resolvedIndex = targetIndex;
    if (resolvedAreaId === areaId) {
      if (index < targetIndex) {
        // 同一エリア内の移動で、元の位置より後ろに入れる場合は 1 つ戻す
        resolvedIndex = targetIndex - 1;
      }
    }
    return { index: resolvedIndex, areaId: resolvedAreaId };
  };

  // draggable events >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // dragstart: ドラッグの開始
  // e.dataTransferの代わりにuseStateを使用すると、より多くのデータを転送できます。
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
    areaId: string,
  ) => {
    // 既にドラッグ中なら二重開始を防ぐ
    if (dragStart) return;
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
    // 自分がドラッグ中の対象でなければ処理しない
    if (!getIsDragging(areaId, index)) return;
    // 開始座標が無い場合はまだドラッグが成立していない
    if (!startPos) return;

    // 最新のマウス座標と対象要素を保存（raf内で使用）
    latestDrag.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.currentTarget,
      index,
      areaId,
    };

    // 既にフレーム予約済みなら追加予約しない（1フレームに1回だけ処理）
    if (dragFrameRequestId.current !== null) return;

    // 次の描画タイミングで重い処理をまとめて実行
    dragFrameRequestId.current = requestAnimationFrame(() => {
      // 予約を解放
      dragFrameRequestId.current = null;
      const payload = latestDrag.current;
      // 最新データまたは開始座標が無ければ何もしない
      if (!payload || !startPos) return;

      // 参照が未準備なら以降の重なり判定は不要
      // 参照が未準備なら以降の重なり判定は不要
      if (!droppableRefList.current) return;
      if (!draggableRefList.current) return;

      // 開始座標からの移動量を計算し、見た目を追従させる
      const distanceX = payload.clientX - startPos.x;
      const distanceY = payload.clientY - startPos.y;
      payload.target.style.transform = `translate(${distanceX}px, ${distanceY}px)`;

      // ドラッグ中の要素の現在の矩形を取得
      // ドラッグ中の要素の現在の矩形を取得
      const dragRect = payload.target.getBoundingClientRect();

      // どのドロップエリアに重なっているかを判定
      const overlappingAreaId = getOverlappingAreaId(dragRect);

      // 重なっている要素が変わった場合のみ更新
      // 重なっている要素が変わった場合のみ更新
      setDragArea(overlappingAreaId);

      // 現在の重なり情報から dragEnd（挿入先のindex）を計算
      const nextDragEnd = resolveDragEnd({
        dragRect,
        areaId: payload.areaId,
        index: payload.index,
        overlappingAreaId,
      });

      // 計算結果を反映
      setDragEnd(nextDragEnd);
    });
  };

  const handleDragLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // ドラッグ中の要素の見た目を即時リセット
    e.currentTarget.style.left = '';
    e.currentTarget.style.top = '';
    e.currentTarget.style.width = '';
    e.currentTarget.style.height = '';
    e.currentTarget.style.position = '';
    e.currentTarget.style.transform = '';
    if (dragFrameRequestId.current !== null) {
      cancelAnimationFrame(dragFrameRequestId.current);
      dragFrameRequestId.current = null;
    }
    latestDrag.current = null;
    // 他要素の transform なども全てクリア
    resetAllDraggableStyles();
    setIsDraggingInfo(undefined);
    setDragStart(null);
    setDragEnd(null);
    setStartPos(null);
    setDraggingSize(null);
    setDragArea(undefined);
  };

  // drop: ドラッグ要素がドロップ要素上にドロップされたとき
  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // ドロップ時も見た目を初期化
    e.currentTarget.style.left = '';
    e.currentTarget.style.top = '';
    e.currentTarget.style.width = '';
    e.currentTarget.style.height = '';
    e.currentTarget.style.position = '';
    e.currentTarget.style.transform = '';
    if (dragFrameRequestId.current !== null) {
      cancelAnimationFrame(dragFrameRequestId.current);
      dragFrameRequestId.current = null;
    }
    latestDrag.current = null;
    resetAllDraggableStyles();

    if (!dragArea) {
      // ドロップ先が無い場合は状態をクリアして終了
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
    // dragEnd に応じて、同一エリア内の他要素を下へずらし隙間を作る
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
