import React, { useState, useEffect } from 'react';

const UpdateTask = ({ taskId }) => {
  const [task, setTask] = useState({ title: '', description: '', assignee: '' });

  useEffect(() => {
  }, [taskId]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={task.title}
        onChange={(e) => setTask({...task, title: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={task.description}
        onChange={(e) => setTask({...task, description: e.target.value})}
      />
      <input
        type="text"
        placeholder="Assignee"
        value={task.assignee}
        onChange={(e) => setTask({...task, assignee: e.target.value})}
      />
      <button type="submit">Update Task</button>
    </form>
  );
};

export default UpdateTask;