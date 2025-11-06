import React, { useState, useEffect } from 'react';
import { expenseAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ExpenseManagement = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });

  const [formData, setFormData] = useState({
    taskId: '',
    categoryId: '',
    amount: '',
    description: '',
    receiptFile: null
  });

  const [editFormData, setEditFormData] = useState({});

  const isFieldEmployee = user?.role === 'Field_Employee_Full_Time' || user?.role === 'Field_Employee_Vendor';
  const isManager = user?.role === 'Manager';
  const isFinance = user?.role === 'Finance';
  const isAdmin = user?.role === 'Admin';
  const canDelete = !isFinance;

  const filteredExpenses = expenses.filter(expense => 
    expense.taskTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchExpenses(true); // Load with default 30-day range
    fetchCategories();
    if (isFieldEmployee) {
      fetchTasks();
    }
  }, []);

  const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchExpenses = async (useRange = false) => {
    try {
      let range = null;
      if (useRange) {
        const formatDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-');
          return `${day}-${month}-${year}`;
        };
        range = `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
      }
      const response = await expenseAPI.getAll(range);
      setExpenses(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await expenseAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    fetchExpenses(true);
  };

  const handleSelectExpense = (expenseId) => {
    setSelectedExpenses(prev =>
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedExpenses.length === 0) return;
    
    setLoading(true);
    try {
      await expenseAPI.delete(selectedExpenses);
      showToast('Expenses deleted successfully', 'success');
      setSelectedExpenses([]);
      fetchExpenses();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await expenseAPI.create(formData);
      showToast('Expense created successfully', 'success');
      setShowAddForm(false);
      setFormData({ taskId: '', categoryId: '', amount: '', description: '', receiptFile: null });
      fetchExpenses();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { expenseId: editExpense.id, ...editFormData };
      await expenseAPI.update(updateData);
      showToast('Expense updated successfully', 'success');
      setEditExpense(null);
      setEditFormData({});
      fetchExpenses();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const canEditExpense = (expense) => {
    if (isFieldEmployee) {
      return expense.status === 'Pending' || expense.status === 'Rejected';
    }
    return true;
  };

  const canEditField = (expense, field) => {
    if (isFieldEmployee) {
      if (expense.status === 'Approved' || expense.paymentStatus === 'Paid') return false;
      return ['amount', 'description', 'receiptFile'].includes(field);
    }
    if (isManager) {
      if (expense.paymentStatus === 'Paid') return false;
      return field === 'status';
    }
    if (isFinance) {
      return ['status', 'paymentStatus'].includes(field);
    }
    if (isAdmin) {
      if (expense.paymentStatus !== 'Pending') return false;
      return true;
    }
    return false;
  };

  const openEditModal = (expense) => {
    setEditExpense(expense);
    const initialData = {};
    
    if (canEditField(expense, 'amount')) initialData.amount = expense.amount;
    if (canEditField(expense, 'description')) initialData.description = expense.description || '';
    if (canEditField(expense, 'categoryId')) initialData.categoryId = expense.categoryId;
    if (canEditField(expense, 'status')) initialData.status = expense.status;
    if (canEditField(expense, 'paymentStatus')) initialData.paymentStatus = expense.paymentStatus;
    
    setEditFormData(initialData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Expenses</h1>
        {isFieldEmployee && (
          <button
            onClick={() => {
              setFormData({ taskId: '', categoryId: '', amount: '', description: '', receiptFile: null });
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Expense
          </button>
        )}
      </div>

      {/* Date Range Filter & Search - Sticky */}
      <div className="sticky top-0 z-10 mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={applyDateFilter}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Apply
          </button>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {selectedExpenses.length > 0 && canDelete && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelected}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Selected ({selectedExpenses.length})
          </button>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {canDelete && <th className="px-4 py-3 text-left">Select</th>}
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                {canDelete && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => handleSelectExpense(expense.id)}
                      className="rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3 font-medium">{expense.taskTitle}</td>
                <td className="px-4 py-3">{expense.categoryName}</td>
                <td className="px-4 py-3">₹{expense.amount}</td>
                <td className="px-4 py-3">{expense.employeeName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(expense.paymentStatus)}`}>
                    {expense.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(expense.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewExpense(expense)}
                      className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                    >
                      View
                    </button>
                    {canEditExpense(expense) && (
                      <button
                        onClick={() => openEditModal(expense)}
                        className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs hover:bg-green-200"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {expenses.length === 0 ? 'No expenses found.' : 'No expenses match your search.'}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task *</label>
                <select
                  required
                  value={formData.taskId}
                  onChange={(e) => setFormData({...formData, taskId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Task</option>
                  {tasks.map(task => (
                    <option key={task.taskId} value={task.taskId}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Receipt</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, receiptFile: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {viewExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Expense Details</h2>
            <div className="space-y-3">
              <div><strong>ID:</strong> {viewExpense.id}</div>
              <div><strong>Task:</strong> {viewExpense.taskTitle}</div>
              <div><strong>Category:</strong> {viewExpense.categoryName}</div>
              <div><strong>Amount:</strong> ₹{viewExpense.amount}</div>
              <div><strong>Description:</strong> {viewExpense.description || 'No description'}</div>
              <div><strong>Employee:</strong> {viewExpense.employeeName}</div>
              <div><strong>Manager:</strong> {viewExpense.managerName}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(viewExpense.status)}`}>
                  {viewExpense.status}
                </span>
              </div>
              <div><strong>Payment Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(viewExpense.paymentStatus)}`}>
                  {viewExpense.paymentStatus}
                </span>
              </div>
              {viewExpense.approverName && <div><strong>Approved By:</strong> {viewExpense.approverName}</div>}
              {viewExpense.approvedAt && <div><strong>Approved At:</strong> {new Date(viewExpense.approvedAt).toLocaleString()}</div>}
              <div><strong>Created At:</strong> {new Date(viewExpense.createdAt).toLocaleString()}</div>
              <div><strong>Updated At:</strong> {new Date(viewExpense.updatedAt).toLocaleString()}</div>
              {viewExpense.receiptUrl && (
                <div>
                  <strong>Receipt:</strong>
                  <img 
                    src={`file:///C:/Users/patel/fieldemployee/uploads/${viewExpense.receiptUrl}`}
                    alt="Receipt" 
                    className="mt-2 max-w-full h-auto rounded border"
                  />
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewExpense(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {canEditField(editExpense, 'amount') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editFormData.amount || ''}
                    onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              {canEditField(editExpense, 'description') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>
              )}

              {canEditField(editExpense, 'categoryId') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={editFormData.categoryId || ''}
                    onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {canEditField(editExpense, 'status') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    required
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              )}

              {canEditField(editExpense, 'paymentStatus') && editExpense.status === 'Approved' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Status *</label>
                  <select
                    required
                    value={editFormData.paymentStatus || ''}
                    onChange={(e) => setEditFormData({...editFormData, paymentStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              )}

              {canEditField(editExpense, 'receiptFile') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Receipt</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditFormData({...editFormData, receiptFile: e.target.files[0]})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditExpense(null);
                    setEditFormData({});
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;