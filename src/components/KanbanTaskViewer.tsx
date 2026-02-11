import { Trash2 } from 'lucide-react';
import Button from './ui/Button';

interface KanbanTaskViewerProps {
  content: string;
  createdAt: Date;
  onEdit: () => void; // Optional function to call when the task is clicked for editing
  onDelete: () => void; // Optional function to call when the task is deleted
}

const KanbanTaskViewer = ({
  content,
  createdAt,
  onEdit,
  onDelete,
}: KanbanTaskViewerProps) => {
  return (
    <>
      <div
        onClick={onEdit}
        className={
          'text-sm ' +
          'text-gray-800 dark:text-gray-100 ' +
          'leading-relaxed ' +
          'hover:text-gray-900 dark:hover:text-white ' +
          'cursor-text ' +
          'h-17.5 overflow-y-auto pr-1 ' +
          'thin-scrollbar'
        }
      >
        {content}
      </div>
      <Button
        className={
          'absolute top-0 right-0 h-8 w-8 p-0 rounded-full transition-colors' +
          ' text-red-600 hover:text-red-700 hover:bg-pink-100' +
          ' dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600' +
          ' opacity-0 group-hover:opacity-100'
        }
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Created {new Date(createdAt).toLocaleDateString()}
      </div>
    </>
  );
};

export default KanbanTaskViewer;
