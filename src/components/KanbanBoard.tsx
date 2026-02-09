import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import Button from './ui/Button';
import { Plus } from 'lucide-react';

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

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex gap-6 overflow-x-auto pb-6 px-6 w-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onDeleteColumn={deleteColumn}
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
    </div>
  );
};

export default KanbanBoard;
