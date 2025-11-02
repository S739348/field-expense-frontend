import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { expenseAPI } from '../../services/api';
import Loading from '../common/Loading';
import Toast from '../common/Toast';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      setToast({
        message: 'Failed to fetch expenses',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (expenseId, status) => {
    setLoading(true);
    try {
      await expenseAPI.update({ expenseId, status });
      setToast({ message: 'Status updated successfully!', type: 'success' });
      fetchExpenses();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Failed to update status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (expenseId, paymentStatus) => {
    setLoading(true);
    try {
      await expenseAPI.update({ expenseId, paymentStatus });
      setToast({ message: 'Payment status updated successfully!', type: 'success' });
      fetchExpenses();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Failed to update payment status',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const canUpdateStatus = (expense) => {
    return hasRole(['Manager', 'Finance', 'Admin']) && 
           expense.paymentStatus === 'Pending';
  };

  const canUpdatePaymentStatus = (expense) => {
    return hasRole(['Finance', 'Admin']) && 
           expense.status === 'Approved';
  };

  return (
    <div className="expense-list">
      {loading && <Loading />}
      
      <div className="page-header">
        <h2>Expenses</h2>
        {hasRole(['Field_Employee_Full_Time', 'Field_Employee_Vendor']) && (
          <button className="btn-primary">Create Expense</button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.taskTitle}</td>
                <td>{expense.employeeName}</td>
                <td>{expense.categoryName}</td>
                <td>₹{expense.amount}</td>
                <td>
                  <span className={`status status-${expense.status.toLowerCase()}`}>
                    {expense.status}
                  </span>
                </td>
                <td>
                  <span className={`status status-${expense.paymentStatus.toLowerCase()}`}>
                    {expense.paymentStatus}
                  </span>
                </td>
                <td>
                  {canUpdateStatus(expense) && expense.status === 'Pending' && (
                    <div className="action-buttons">
                      <button 
                        className="btn-success"
                        onClick={() => handleStatusUpdate(expense.id, 'Approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleStatusUpdate(expense.id, 'Rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  
                  {canUpdatePaymentStatus(expense) && (
                    <select
                      value={expense.paymentStatus}
                      onChange={(e) => handlePaymentStatusUpdate(expense.id, e.target.value)}
                      disabled={expense.paymentStatus !== 'Pending'}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Paid">Paid</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
