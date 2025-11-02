import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [fieldEmployees, setFieldEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [editFormData, setEditFormData] = useState({});
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

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employeeId: ''
  });

  const isManagerOrAdmin = user?.role === 'Manager' || user?.role === 'Admin';
  const isFieldEmployee = user?.role === 'Field_Employee_Full_Time' || user?.role === 'Field_Employee_Vendor';
  const canEdit = !['Hr', 'Finance'].includes(user?.role);

  useEffect(() => {
    fetchTasks();
    if (isManagerOrAdmin) {
      fetchFieldEmployees();
    }
  }, []);

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    fetchTasks(true);
  };

  const fetchTasks = async (useRange = false) => {
    try {
      let range = null;
      if (useRange) {
        // Convert YYYY-MM-DD to DD-MM-YYYY format
        const formatDate = (dateStr) => {
          const [year, month, day] = dateStr.split('-');
          return `${day}-${month}-${year}`;
        };
        range = `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
        console.log('Applying date range filter:', range);
      }
      const response = await taskAPI.getAll(range);
      setTasks(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      showToast(errorMessage, 'error');
    }
  };

  const fetchFieldEmployees = async () => {
    try {
      const response = await taskAPI.getFieldEmployees();
      setFieldEmployees(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch field employees';
      showToast(errorMessage, 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.length === 0) return;
    
    setLoading(true);
    try {
      await taskAPI.delete(selectedTasks);
      showToast('Tasks deleted successfully', 'success');
      setSelectedTasks([]);
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete tasks';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await taskAPI.create(formData);
      showToast('Task created successfully', 'success');
      setShowAddForm(false);
      setFormData({ title: '', description: '', employeeId: '' });
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { taskId: editTask.taskId, ...editFormData };
      await taskAPI.update(updateData);
      showToast('Task updated successfully', 'success');
      setEditTask(null);
      setEditFormData({});
      fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      'Created': ['Created', 'Started', 'Cancelled', 'Rejected'],
      'Started': ['Started', 'Completed', 'Cancelled', 'Rejected'],
      'Completed': ['Completed'],
      'Cancelled': ['Cancelled'],
      'Rejected': ['Rejected']
    };
    return statusFlow[currentStatus] || ['Created'];
  };

  const canEditTask = (task) => {
    return task.status !== 'Completed';
  };

  const canEditTimeFields = (task) => {
    return task.status !== 'Completed' && (!task.startTime || !task.endTime);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    if (isFieldEmployee) {
      setEditFormData({
        status: task.status,
        startTime: task.startTime ? task.startTime.slice(0, 16) : '',
        endTime: task.endTime ? task.endTime.slice(0, 16) : ''
      });
    } else if (isManagerOrAdmin) {
      setEditFormData({
        title: task.title,
        description: task.description || '',
        employeeId: task.employeeId,
        status: task.status,
        startTime: task.startTime ? task.startTime.slice(0, 16) : '',
        endTime: task.endTime ? task.endTime.slice(0, 16) : ''
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
        {isManagerOrAdmin && (
          <button
            onClick={() => {
              setFormData({ title: '', description: '', employeeId: '' });
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Task
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
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      {selectedTasks.length > 0 && isManagerOrAdmin && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelected}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Selected ({selectedTasks.length})
          </button>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isManagerOrAdmin && <th className="px-4 py-3 text-left">Select</th>}
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Assigned To</th>
              {user?.role !== 'Manager' && <th className="px-4 py-3 text-left">Manager</th>}
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.taskId} className="border-t">
                {isManagerOrAdmin && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.taskId)}
                      onChange={() => handleSelectTask(task.taskId)}
                      className="rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3">{task.description || 'No description'}</td>
                <td className="px-4 py-3">{task.employeeName}</td>
                {user?.role !== 'Manager' && (
                  <td className="px-4 py-3">{task.managerName}</td>
                )}
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'Started' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Created' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    task.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(task.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewTask(task)}
                      className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                    >
                      View
                    </button>
                    {canEdit && canEditTask(task) && (
                      <button
                        onClick={() => openEditModal(task)}
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
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {tasks.length === 0 ? 'No tasks found.' : 'No tasks match your search.'}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Add Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter task description (optional)"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Assign To *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Employee</option>
                  {fieldEmployees.map(employee => (
                    <option key={employee.employeeId} value={employee.employeeId}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
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

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Task Details</h2>
            <div className="space-y-3">
              <div><strong>Task ID:</strong> {viewTask.taskId}</div>
              <div><strong>Title:</strong> {viewTask.title}</div>
              <div><strong>Description:</strong> {viewTask.description || 'No description'}</div>
              <div><strong>Assigned To:</strong> {viewTask.employeeName}</div>
              <div><strong>Employee ID:</strong> {viewTask.employeeId}</div>
              <div><strong>Manager:</strong> {viewTask.managerName}</div>
              <div><strong>Manager ID:</strong> {viewTask.managerId}</div>
              <div><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  viewTask.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  viewTask.status === 'Started' ? 'bg-yellow-100 text-yellow-800' :
                  viewTask.status === 'Created' ? 'bg-blue-100 text-blue-800' :
                  viewTask.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  viewTask.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viewTask.status}
                </span>
              </div>
              <div><strong>Created At:</strong> {new Date(viewTask.createdAt).toLocaleString()}</div>
              <div><strong>Updated At:</strong> {new Date(viewTask.updatedAt).toLocaleString()}</div>
              {viewTask.startTime && <div><strong>Start Time:</strong> {new Date(viewTask.startTime).toLocaleString()}</div>}
              {viewTask.endTime && <div><strong>End Time:</strong> {new Date(viewTask.endTime).toLocaleString()}</div>}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewTask(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {isManagerOrAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Assign To *</label>
                    <select
                      required
                      value={editFormData.employeeId || ''}
                      onChange={(e) => setEditFormData({...editFormData, employeeId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Employee</option>
                      {fieldEmployees.map(employee => (
                        <option key={employee.employeeId} value={employee.employeeId}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Status *</label>
                <select
                  required
                  value={editFormData.status || ''}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={editTask.status === 'Completed'}
                >
                  {getAvailableStatuses(editTask.status).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={editFormData.startTime || ''}
                  onChange={(e) => setEditFormData({...editFormData, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={editTask.status === 'Completed' || (editTask.startTime && editTask.startTime !== null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={editFormData.endTime || ''}
                  onChange={(e) => setEditFormData({...editFormData, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={editTask.status === 'Completed' || (editTask.endTime && editTask.endTime !== null)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditTask(null);
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

export default TaskManagement;