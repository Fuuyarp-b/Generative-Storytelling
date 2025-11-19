import React from 'react';
import { DataStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, DollarSign, FileText } from 'lucide-react';

interface DashboardProps {
  stats: DataStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Key Metrics Cards */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <FileText size={20} />
            <span className="text-sm font-medium">Total Rows</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalRows.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <DollarSign size={20} />
            <span className="text-sm font-medium">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <Users size={20} />
            <span className="text-sm font-medium">Top Performer</span>
          </div>
          <p className="text-lg font-bold text-gray-800 truncate" title={stats.topBA?.name}>
            {stats.topBA?.name || '-'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">Categories</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.categoryBreakdown.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Monthly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Categories</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.categoryBreakdown} layout="vertical">
               <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#475569" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};