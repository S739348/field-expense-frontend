import React, { useState } from 'react';

const CreateCategory = () => {
  const [category, setCategory] = useState({ name: '', description: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={category.name}
        onChange={(e) => setCategory({...category, name: e.target.value})}
      />
      <input
        type="text"
        placeholder="Description"
        value={category.description}
        onChange={(e) => setCategory({...category, description: e.target.value})}
      />
      <button type="submit">Create Category</button>
    </form>
  );
};

export default CreateCategory;