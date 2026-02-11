import { useEffect, useRef, useState } from 'react';
import type { Task } from './KanbanBoard';
import KanbanTaskEditor from './KanbanTaskEditor';
import KanbanTaskViewer from './KanbanTaskViewer';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanTaskProps {
  task: Task;
  index: number;
  onUpdate: (taskId: string, newContent: string) => void;
  onDelete: (taskId: string) => void;
}

const KanbanTask = ({ task, index, onUpdate, onDelete }: KanbanTaskProps) => {
  const [isEditing, setIsEditing] = useState(false);

  console.log(isEditing);

  const [tempContent, setTempContent] = useState(task.content);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSave = () => {
    onUpdate(task.id, tempContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(task.content);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      // HTMLInputElement.setSelectionRange() メソッドは、 <input> または <textarea> 要素の中で現在のテキストの選択範囲の開始位置と終了位置を設定
      // setSelectionRange(selectionStart, selectionEnd)
      // selectionStart：選択する最初の文字の 0 から始まる位置
      // selectionEnd：選択する最後の文字の次の 0 から始まる位置
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [isEditing]);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={
            'group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200' +
            `${
              snapshot.isDragging
                ? 'rotate-3 shadow-lg ring-2 ring-blue-300 ring-opacity-50'
                : ''
            }`
          }
        >
          <div className="relative">
            {isEditing ? (
              <KanbanTaskEditor
                taskId={task.id}
                tempContent={tempContent}
                setTempContent={setTempContent}
                onSave={handleSave}
                onCancel={handleCancel}
                textareaRef={textareaRef}
                onDelete={onDelete}
              />
            ) : (
              <KanbanTaskViewer
                content={task.content}
                createdAt={task.createdAt}
                onEdit={() => setIsEditing(true)}
                onDelete={() => onDelete(task.id)}
              />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanTask;
