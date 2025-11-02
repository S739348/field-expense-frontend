import React, { useState } from 'react';

const CreateEmployee = () => {
  const [employee, setEmployee] = useState({ name: '', email: '', position: '' });

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
      <button type="submit">Create Employee</button>
    </form>
  );
};

export default CreateEmployee;