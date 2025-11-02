import React from 'react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <h3>Quick Actions</h3>
        <ul className="sidebar-menu">
          <li><a href="#create-employee">Add Employee</a></li>
          <li><a href="#create-task">Add Task</a></li>
          <li><a href="#create-expense">Add Expense</a></li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;