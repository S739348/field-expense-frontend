import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../services/api';
import EmployeeManagement from '../EmployeeManagement';
import CategoryManagement from '../CategoryManagement';
import TaskManagement from '../TaskManagement';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  const userProfile = {
    name: user?.name || user?.firstName + ' ' + user?.lastName || 'User',
    role: user?.role || user?.designation || 'Employee',
    avatar: user?.profileUrl ? `file:///C:/Users/patel/fieldemployee/uploads/${user.profileUrl}` : 'https://via.placeholder.com/40',
    email: user?.email || user?.username,
    phone: user?.mobileNumber || user?.mobile || user?.phone || user?.phoneNumber,
    employeeId: user?.employeeId,
    managerId: user?.managerId,
    managerName: user?.managerName
  };

  const isHrOrAdmin = user?.role === 'Hr' || user?.role === 'Admin';
  
  const navItems = [
    { name: 'Dashboard' },
    { name: 'Tasks' },
    ...(isHrOrAdmin ? [{ name: 'Categories' }] : []),
    { name: 'Employees' },
    { name: 'Expenses' },
    { name: 'Profile' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src={userProfile.avatar} 
              alt="User" 
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-medium text-gray-900">{userProfile.name}</h3>
              <p className="text-sm text-gray-500">{userProfile.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.name
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'Dashboard' && <Dashboard />}
        {activeTab === 'Tasks' && <TaskManagement />}
        {activeTab === 'Categories' && <CategoryManagement />}
        {activeTab === 'Employees' && <EmployeeManagement />}
        {activeTab === 'Expenses' && <div className="p-6"><h2 className="text-2xl font-bold">Expenses</h2></div>}
        {activeTab === 'Profile' && <Profile userProfile={userProfile} />}
      </div>
    </div>
  );
};

// Import Dashboard component
const Dashboard = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activeFilter, setActiveFilter] = useState('Today');

  const stats = [
    { title: 'Total Expenses', value: '$12,450.78', change: '+2.5%', positive: true },
    { title: 'Pending For Approval', value: '15', change: '+3', positive: true },
    { title: 'Rejected', value: '2', change: '-1', positive: true },
    { title: 'Approved', value: '48', change: '+5', positive: true },
    { title: 'Active Users', value: '24', change: '+2', positive: true },
  ];

  const filters = ['Today', 'This Week', 'This Month', 'This Year'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium">
          Generate Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeFilter === filter
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
        <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg">
          <span>📅</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            className="bg-transparent text-sm"
          />
          <span>-</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            className="bg-transparent text-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className={`text-sm font-medium mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spending Over Time */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Spending Over Time</h3>
          <p className="text-3xl font-bold mb-1">$12,450.78</p>
          <p className="text-gray-600 mb-4">This Month <span className="text-green-600">+2.5%</span></p>
          <div className="h-40 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-end justify-center">
            <div className="text-gray-500">📈 Chart Placeholder</div>
          </div>
        </div>

        {/* Tasks This Month */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Tasks This Month</h3>
          <p className="text-3xl font-bold mb-1">156</p>
          <p className="text-gray-600 mb-4">Completed <span className="text-green-600">+12%</span></p>
          <div className="h-40 bg-gradient-to-r from-green-100 to-green-50 rounded-lg flex items-end justify-center">
            <div className="text-gray-500">📊 Chart Placeholder</div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Location */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Live Location</h3>
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">🗺️ Map Placeholder</div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Expense Distribution</h3>
          <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-gray-500">🥧 Pie Chart</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-sm">Travel (45%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm">Food (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span className="text-sm">Supplies (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-sm">Others (10%)</span>
            </div>
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Approval Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '20%'}}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rejected</span>
              <span className="text-sm font-medium">5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{width: '5%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const Profile = ({ userProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Mobile validation (Indian phone number)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid Indian mobile number';
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, number & special char';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setFormData({
      name: userProfile.name,
      mobile: userProfile.phone,
      password: ''
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await employeeAPI.updateProfile(formData);
      
      // Update local storage and context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...user,
        name: formData.name,
        mobileNumber: formData.mobile
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(updatedUser);
      
      setIsEditing(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ 
        message: 'Failed to update profile: ' + (error.response?.data?.message || error.message), 
        type: 'error' 
      });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: '', mobile: '', password: '' });
    setErrors({});
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Profile</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-6 mb-6">
          <img 
            src={userProfile.avatar} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-gray-200"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
            <p className="text-lg text-gray-600">{userProfile.role}</p>
            <p className="text-sm text-gray-500">ID: {userProfile.employeeId}</p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
              <button 
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{userProfile.phone}</p>
                </div>
                {userProfile.managerId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager ID</label>
                    <p className="text-gray-900">{userProfile.managerId}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <p className="text-gray-900">{userProfile.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <p className="text-gray-900">{userProfile.role}</p>
                </div>
                {userProfile.managerName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <p className="text-gray-900">{userProfile.managerName}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Toast Notification */}
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

export default Navbar;