import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [editEmployee, setEditEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    role: '',
    managerId: '',
    profileImage: null
  });

  const isHrOrAdmin = user?.role === 'Hr' || user?.role === 'Admin';

  useEffect(() => {
    fetchEmployees();
    if (isHrOrAdmin) {
      fetchRoles();
      fetchManagers();
    }
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await employeeAPI.getRoles();
      setRoles(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await employeeAPI.getManagers();
      setManagers(response.data);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedEmployees.length === 0) return;
    
    setLoading(true);
    try {
      await employeeAPI.delete(selectedEmployees);
      showToast('Employees deleted successfully', 'success');
      setSelectedEmployees([]);
      fetchEmployees();
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
      const submitData = { ...formData };
      if (!['Field_Employee_Full_Time', 'Field_Employee_Vendor'].includes(formData.role)) {
        delete submitData.managerId;
      }
      
      await employeeAPI.create(submitData);
      showToast('Employee created successfully', 'success');
      setShowAddForm(false);
      setFormData({
        name: '', mobile: '', email: '', password: '', role: '', managerId: '', profileImage: null
      });
      fetchEmployees();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const needsManager = ['Field_Employee_Full_Time', 'Field_Employee_Vendor'].includes(formData.role);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Employees</h1>
        {isHrOrAdmin && (
          <button
            onClick={() => {
              setFormData({
                name: '',
                mobile: '',
                email: '',
                password: '',
                role: '',
                managerId: '',
                profileImage: null
              });
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Employee
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Delete Button */}
      {selectedEmployees.length > 0 && isHrOrAdmin && (
        <div className="mb-4">
          <button
            onClick={handleDeleteSelected}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete Selected ({selectedEmployees.length})
          </button>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isHrOrAdmin && <th className="px-4 py-3 text-left">Select</th>}
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employeeId} className="border-t">
                {isHrOrAdmin && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.employeeId)}
                      onChange={() => handleSelectEmployee(employee.employeeId)}
                      className="rounded"
                    />
                  </td>
                )}
                <td className="px-4 py-3">{employee.name}</td>
                <td className="px-4 py-3">{employee.email}</td>
                <td className="px-4 py-3">{employee.mobile}</td>
                <td className="px-4 py-3">{employee.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewEmployee(employee)}
                      className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                    >
                      View
                    </button>
                    {isHrOrAdmin && (
                      <button
                        onClick={() => {
                          setEditEmployee(employee);
                          setFormData({
                            name: employee.name,
                            mobile: employee.mobile,
                            email: employee.email,
                            password: '',
                            role: employee.role,
                            managerId: employee.managerId || '',
                            profileImage: null
                          });
                        }}
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
      </div>

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {needsManager && (
                <div>
                  <label className="block text-sm font-medium mb-1">Manager *</label>
                  <select
                    required
                    value={formData.managerId}
                    onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Manager</option>
                    {managers.map(manager => (
                      <option key={manager.employeeId} value={manager.employeeId}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, profileImage: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Employee'}
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

      {/* View Employee Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
            <div className="space-y-3">
              {viewEmployee.profileUrl && (
                <div className="text-center mb-4">
                  <img
                    src={`file:///C:/Users/patel/fieldemployee/uploads/${viewEmployee.profileUrl}`}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto border-4 border-gray-200"
                  />
                </div>
              )}
              <div><strong>Name:</strong> {viewEmployee.name}</div>
              <div><strong>Email:</strong> {viewEmployee.email}</div>
              <div><strong>Mobile:</strong> {viewEmployee.mobile}</div>
              <div><strong>Role:</strong> {viewEmployee.role}</div>
              <div><strong>Status:</strong> {viewEmployee.status}</div>
              <div><strong>Employee ID:</strong> {viewEmployee.employeeId}</div>
              {viewEmployee.managerId && <div><strong>Manager ID:</strong> {viewEmployee.managerId}</div>}
              {viewEmployee.managerName && <div><strong>Manager Name:</strong> {viewEmployee.managerName}</div>}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setViewEmployee(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const updateData = {...formData, employeeId: editEmployee.employeeId};
                if (!formData.password || formData.password.trim() === '') {
                  delete updateData.password;
                }
                await employeeAPI.update(updateData);
                showToast('Employee updated successfully', 'success');
                setEditEmployee(null);
                fetchEmployees();
              } catch (error) {
                showToast(getErrorMessage(error), 'error');
              } finally {
                setLoading(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mobile *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {['Field_Employee_Full_Time', 'Field_Employee_Vendor'].includes(formData.role) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Manager</label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Manager</option>
                    {managers.map(manager => (
                      <option key={manager.employeeId} value={manager.employeeId}>
                        {manager.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, profileImage: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Employee'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditEmployee(null)}
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

export default EmployeeManagement;