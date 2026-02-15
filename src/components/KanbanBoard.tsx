import { useEffect, useState } from 'react';
import KanbanColumn from './KanbanColumn';
import Button from './ui/Button';
import { Plus } from 'lucide-react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { defoultColumns } from '../data/columns';
import useColumn from './useColumn';

const KanbanBoard = () => {
  const [columns, setColumns] = useState(defoultColumns);

  const {
    addColumn,
    deleteColumn,
    updateColumnTitle,
    addTask,
    updateTask,
    deleteTask,
  } = useColumn({ columns, setColumns });

  const [dragStart, setDragStart] = useState<{
    index: number;
    areaId: string;
  } | null>(null);
  // const [dragEnd, setDragEnd] = useState<{
  //   index: number;
  //   areaId: string;
  // } | null>(null);
  const [noDrop, setNoDrop] = useState<'' | 'noDrop'>('');
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [distancePos, setDistancePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // dragstart: ドラッグの開始
  // e.dataTransferの代わりにuseStateを使用すると、より多くのデータを転送できます。
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    areaId: string,
  ) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragStart({ index, areaId });
    const currentHeight = e.currentTarget.offsetHeight;
    const currentWidth = e.currentTarget.offsetWidth;
    const currentPositionX = e.currentTarget.getBoundingClientRect().x;
    const currentPositionY = e.currentTarget.getBoundingClientRect().y;
    const ghostElement = e.currentTarget.cloneNode(true) as HTMLDivElement;
    ghostElement.style.opacity = '0';
    document.body.appendChild(ghostElement);
    e.currentTarget.style.left = `${currentPositionX}px`;
    e.currentTarget.style.top = `${currentPositionY}px`;
    e.currentTarget.style.width = `${currentWidth}px`;
    e.currentTarget.style.height = `${currentHeight}px`;
    e.currentTarget.style.position = 'fixed';
    e.currentTarget.style.zIndex = '1000';
    e.currentTarget.style.opacity = '0.8';
    e.currentTarget.style.transition = 'opacity 0.2s ease';
    e.dataTransfer.setDragImage(ghostElement, 0, 0); // ドラッグ中のデフォルトのイメージを消す
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    if (startPos) {
      const distanceX = e.clientX - startPos.x;
      const distanceY = e.clientY - startPos.y;
      e.currentTarget.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
      setDistancePos({ x: distanceX, y: distanceY });
    }
  };

  // drageenter: ドラッグ要素がドロップ要素内に入った時
  // noDrop ゾーンに入ると、状態が更新され、スタイル設定に使用されます。
  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    areaId?: string,
  ) => {
    // console.log('dragEnter', e, areaId);
    if (!areaId) {
      setNoDrop('noDrop');
    }
  };

  // dragover: ドラッグ要素がドロップ要素上にある時(※ 繰り返し呼ばれ続ける)
  // これがないとDNDは機能しません
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // console.log('dragover', e);
    e.preventDefault();
  };

  // dragleave: ドラッグ要素がドロップ要素から抜けたとき
  // setNoDrop を nothing に設定すると、スタイルが通常に戻ります
  const handleDragLeave = () => {
    // console.log('dragLeave', e);
    setNoDrop('');
  };

  // drop: ドラッグ要素がドロップ要素上にドロップされたとき
  const handelDragEnd = (
    e: React.DragEvent<HTMLDivElement>,
    // index: number,
    areaId: string,
  ) => {
    e.currentTarget.style.left = '';
    e.currentTarget.style.top = '';
    e.currentTarget.style.width = '';
    e.currentTarget.style.height = '';
    e.currentTarget.style.position = '';
    e.currentTarget.style.transform = '';
    // console.log('drop', e, areaId);
    // const { source, destination } = result;
    setStartPos(null);
    setDistancePos(null);
    setNoDrop('');
    const source = dragStart;
    const destination = { areaId };

    if (!destination || !source) return;

    if (
      source?.areaId === destination.areaId
      // source.index === destination.index
    ) {
      return;
    }

    // Find the column object for the source of the drag
    const sourceColumn = columns.find((col) => col.id === source.areaId);

    // Find the column object for the destination of the drag
    const destColumn = columns.find((col) => col.id === destination.areaId);

    if (!sourceColumn || !destColumn) return;

    // Create a shallow copy of the source column's tasks to avoid direct mutation
    const sourceTasks = [...sourceColumn.tasks];

    // Remove the task from the sourceTasks array using the index
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // If the task is moved within the same column (reordering)
    if (sourceColumn === destColumn) {
      // Insert the task at the new position within the same task array
      sourceTasks.splice(0, 0, movedTask);

      // Update the columns state with the modified column
      setColumns(
        columns.map((col) =>
          col.id === sourceColumn.id ? { ...col, tasks: sourceTasks } : col,
        ),
      );
    } else {
      // If the task is moved to a different column

      // Create a shallow copy of the destination column's tasks
      const destTasks = [...destColumn.tasks];

      // Insert the moved task into the destination at the target index
      destTasks.splice(0, 0, movedTask);

      // Update both the source and destination columns in the state
      setColumns(
        columns.map((col) => {
          // update source column
          if (col.id === sourceColumn.id) return { ...col, tasks: sourceTasks };
          // update destination column
          if (col.id === destColumn.id) return { ...col, tasks: destTasks };
          // unchanged columns
          return col;
        }),
      );
    }

    // Reset drag state
    setDragStart(null);
  };

  return (
    <div className="w-full min-h-screen flex items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* <DragDropContext onDragEnd={handelDragEnd}> */}
      <div className="flex gap-6 overflow-x-auto pb-6 px-6 w-full thin-scrollbar">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDeleteColumn={deleteColumn}
            onAddTask={addTask}
            onUpdateTitle={updateColumnTitle}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onDragEnter={handleDragEnter}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handelDragEnd}
            handleDragStart={handleDragStart}
            handelDragEnd={handelDragEnd}
            handleDrag={handleDrag}
          />
        ))}

        <div className="shrink-0">
          <Button
            onClick={addColumn}
            className="h-12 px-6 rounded-md bg-white/50 dark:bg-gray-700 dark:text-white hover:bg-white/80 dark:hover:bg-gray-600 border-dashed border-2 border-gray-300 dark:border-gray-500 hover:border-gray-400 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
      {/* </DragDropContext> */}
    </div>
  );
};

export default KanbanBoard;
