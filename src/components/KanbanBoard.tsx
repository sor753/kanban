import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import Button from './ui/Button';
import { Plus } from 'lucide-react';
import { defoultColumns } from '../data/columns';
import useColumn from './useColumn';
import DndContextProvider from './DndContextProvider';

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

  const handelDragEnd = (result: {
    dragStart: {
      index: number;
      areaId: string;
    } | null;
    dragEnd: {
      index: number;
      areaId: string;
    } | null;
  }) => {
    const { dragStart: source, dragEnd: destination } = result;
    console.log('source', source);
    console.log('destination', destination);

    if (!destination || !source) return;

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
      // Insert the task at the destination index within the same task array
      sourceTasks.splice(destination.index, 0, movedTask);

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
      destTasks.splice(destination.index, 0, movedTask);

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
  };

  return (
    <div className="w-full min-h-screen flex items-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <DndContextProvider onDragEnd={handelDragEnd}>
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
      </DndContextProvider>
    </div>
  );
};

export default KanbanBoard;
