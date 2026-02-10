import { Trash2 } from 'lucide-react';
import Button from './ui/Button';

interface KanbanTaskEditorProps {
  taskId: string;
  tempContent: string;
  setTempContent: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onDelete: (taskId: string) => void;
}

const KanbanTaskEditor = ({
  taskId,
  tempContent,
  setTempContent,
  onSave,
  onCancel,
  textareaRef,
  onDelete,
}: KanbanTaskEditorProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey)
      onSave(); // Ctrl+Enter saves the task
    else if (e.key === 'Escape') onCancel(); // Esc cancels the edit
  };

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef} // Bind Ref for focus and selection
        value={tempContent} // Controlled input bound to tempContent
        onChange={(e) => setTempContent(e.target.value)} // Update tempContent on change
        autoFocus // Focus this textarea when rendered
        onKeyDown={handleKeyDown} // Handle special keyboard events
        onBlur={onSave} // Save automatically on blur
        className={
          'w-full resize-none min-h-17.5 rounded-md ' +
          'border border-blue-200 dark:border-blue-500 ' +
          'px-3 py-2 text-sm ' +
          'bg-white dark:bg-gray-800 ' +
          'text-gray-800 dark:text-gray-100 ' +
          'focus:outline-none focus:ring-2 focus:ring-blue-400 ' +
          'thin-scrollbar'
        }
      />

      {/* Instructional text and delete button */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Ctrl+Enter to save, Esc to cancel.{' '}
        {/* Delete button positioned inline */}
        <Button
          onClick={() => onDelete(taskId)}
          className="p-1 h-6 w-6 rounded-full text-red-600 hover:text-red-700 hover:bg-pink-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600  translate-y-0.5"
        >
          {/* Trash icon inside the button */}
          <Trash2 className="w-4 h-4" />
        </Button>
      </p>
    </div>
  );
};

export default KanbanTaskEditor;
