interface KanbanTaskViewerProps {
  content: string;
  createdAt: Date;
}

const KanbanTaskViewer = ({ content, createdAt }: KanbanTaskViewerProps) => {
  return (
    <>
      <div className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed hover:text-gray-900 dark:hover:text-white cursor-text h-17.5 overflow-y-auto pr-1">
        {content}
      </div>
      <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Created {new Date(createdAt).toLocaleDateString()}
      </div>
    </>
  );
};

export default KanbanTaskViewer;
