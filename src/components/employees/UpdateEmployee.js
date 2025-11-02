import React, { useState, useEffect } from 'react';

const UpdateEmployee = ({ employeeId }) => {
  const [employee, setEmployee] = useState({ name: '', email: '', position: '' });

  useEffect(() => {
  }, [employeeId]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={employee.name}
        onChange={(e) => setEmployee({...employee, name: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={employee.email}
        onChange={(e) => setEmployee({...employee, email: e.target.value})}
      />
      <input
        type="text"
        placeholder="Position"
        value={employee.position}
        onChange={(e) => setEmployee({...employee, position: e.target.value})}
      />
      <button type="submit">Update Employee</button>
    </form>
  );
};

export default UpdateEmployee;