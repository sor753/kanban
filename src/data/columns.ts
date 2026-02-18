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

export const defoultColumns: Column[] = [
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
      {
        id: 'task-5',
        content: 'Write unit tests for API endpoints',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
      {
        id: 'task-6',
        content: 'Research new frontend framework',
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
      {
        id: 'task-7',
        content: 'Optimize database queries',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
      {
        id: 'task-8',
        content: 'Update project documentation',
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
      {
        id: 'task-9',
        content: 'Set up CI/CD pipeline',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
      {
        id: 'task-10',
        content: 'Conduct code review for recent PRs',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
      {
        id: 'task-11',
        content: 'Deploy latest version to staging',
        createdAt: new Date('2025-07-25T00:00:00'),
      },
    ],
  },
];
