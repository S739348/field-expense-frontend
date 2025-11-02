import React, { useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
    </div>
  );
};

export default Dashboard;