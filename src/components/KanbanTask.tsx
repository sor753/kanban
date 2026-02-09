import { useState } from 'react';
import type { Task } from './KanbanBoard';
import KanbanTaskEditor from './KanbanTaskEditor';
import KanbanTaskViewer from './KanbanTaskViewer';

interface KanbanTaskProps {
  task: Task;
  index: number;
}

const KanbanTask = ({ task, index }: KanbanTaskProps) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 raounded-lg p-2 shadow-sm hover:shadow-md transition-all transition-200">
      <div>
        {isEditing ? (
          <KanbanTaskEditor taskId={task.id} />
        ) : (
          <KanbanTaskViewer content={task.content} createdAt={task.createdAt} />
        )}
      </div>
    </div>
  );
};

export default KanbanTask;
