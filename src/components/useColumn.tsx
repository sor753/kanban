import type { Column } from '../data/columns';

interface ColumnProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

const useColumn = ({ columns, setColumns }: ColumnProps) => {
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

  return {
    addColumn,
    deleteColumn,
    updateColumnTitle,
    addTask,
    updateTask,
    deleteTask,
  };
};

export default useColumn;
