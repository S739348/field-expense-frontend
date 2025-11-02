import React, { useState } from 'react';

const CreateExpense = () => {
  const [expense, setExpense] = useState({ description: '', amount: '', category: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Description"
        value={expense.description}
        onChange={(e) => setExpense({...expense, description: e.target.value})}
      />
      <input
        type="number"
        placeholder="Amount"
        value={expense.amount}
        onChange={(e) => setExpense({...expense, amount: e.target.value})}
      />
      <input
        type="text"
        placeholder="Category"
        value={expense.category}
        onChange={(e) => setExpense({...expense, category: e.target.value})}
      />
      <button type="submit">Create Expense</button>
    </form>
  );
};

export default CreateExpense;