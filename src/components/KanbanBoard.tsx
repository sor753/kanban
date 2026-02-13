import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import Button from './ui/Button';
import { Plus } from 'lucide-react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';

export type Task = {
  id: string;
  content: string;
  createdAt: Date;
};

export type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

const defoultColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: 'task-1',
        content: 'Design new landing page',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
      {
        id: 'task-2',
        content: 'Set up database schema',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: 'task-3',
        content: 'Implement user authentication',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: 'task-4',
        content: 'Create project structure',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
    ],
  },
];

const KanbanBoard = () => {
  const [columns, setColumns] = useState(defoultColumns);

  const addColumn = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    event.preventDefault();

    setColumns([
      ...columns,
      { id: `column-${Date.now()}`, title: 'New Column', tasks: [] },
    ]);
  };

  const deleteColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId));
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col,
      ),
    );
  };

  const addTask = (columnId: string) => {
    const newTask = {
      id: `task-${Date.now()}`,
      content: 'New Task',
      createdAt: new Date(),
    };
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col,
      ),
    );
  };

  const updateTask = (taskId: string, newContent: string) => {
    setColumns(
      columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId ? { ...task, content: newContent } : task,
        ),
      })),
    );
  };

  const deleteTask = (taskId: string) => {
    console.log(taskId);
    console.log(columns);

    setColumns(
      columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    );
  };

  const [dragStart, setDragStart] = useState<{
    index: number;
    areaId: string;
  } | null>(null);
  // const [dragEnd, setDragEnd] = useState<{
  //   index: number;
  //   areaId: string;
  // } | null>(null);
  const [noDrop, setNoDrop] = useState<'' | 'noDrop'>('');

  // dragstart: ドラッグの開始
  // e.dataTransferの代わりにuseStateを使用すると、より多くのデータを転送できます。
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
    areaId: string,
  ) => {
    console.log('dragStart', e, index, areaId);
    setDragStart({ index, areaId });
  };

  // drageenter: ドラッグ要素がドロップ要素内に入った時
  // noDrop ゾーンに入ると、状態が更新され、スタイル設定に使用されます。
  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    areaId?: string,
  ) => {
    console.log('dragEnter', e, areaId);
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
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('dragLeave', e);
    setNoDrop('');
  };

  // drop: ドラッグ要素がドロップ要素上にドロップされたとき
  const handelDragEnd = (
    e: React.DragEvent<HTMLDivElement>,
    // index: number,
    areaId: string,
  ) => {
    console.log('drop', e, areaId);
    // const { source, destination } = result;
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
