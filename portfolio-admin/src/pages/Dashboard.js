import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../lib/api';
import {
  FolderKanban,
  FileText,
  Code,
  Briefcase,
  MessageSquare,
  Layers,
  Mail,
  TrendingUp,
  Clock,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-6 shadow-soft border border-slate-100">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    blogs: 0,
    skills: 0,
    experience: 0,
    testimonials: 0,
    services: 0,
    messages: { total: 0, unread: 0 }
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stats
      try {
        const statsRes = await dashboardAPI.getStats();
        if (statsRes?.data?.data) {
          setStats(prev => ({ ...prev, ...statsRes.data.data }));
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
      
      // Fetch activity
      try {
        const activityRes = await dashboardAPI.getActivity();
        const activityData = activityRes?.data?.data || {};
        const formattedActivity = [];
        
        // Add projects
        if (activityData.projects && Array.isArray(activityData.projects)) {
          activityData.projects.forEach(item => {
            formattedActivity.push({
              type: 'project',
              title: item.title || 'Untitled',
              action: 'updated',
              timestamp: item.updated_at
            });
          });
        }
        
        // Add blogs
        if (activityData.blogs && Array.isArray(activityData.blogs)) {
          activityData.blogs.forEach(item => {
            formattedActivity.push({
              type: 'blog',
              title: item.title || 'Untitled',
              action: 'updated',
              timestamp: item.updated_at
            });
          });
        }
        
        // Add messages
        if (activityData.messages && Array.isArray(activityData.messages)) {
          activityData.messages.forEach(item => {
            formattedActivity.push({
              type: 'message',
              title: item.name || 'Unknown',
              action: 'new message',
              timestamp: item.created_at
            });
          });
        }
        
        // Sort by timestamp
        formattedActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setActivity(formattedActivity);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      }
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500">Overview of your portfolio content</p>
        {error && (
          <p className="text-yellow-600 text-sm mt-1">{error}</p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={stats?.projects || 0}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          icon={FileText}
          label="Blogs"
          value={stats?.blogs || 0}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          icon={Code}
          label="Skills"
          value={stats?.skills || 0}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Briefcase}
          label="Experience"
          value={stats?.experience || 0}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Testimonials"
          value={stats?.testimonials || 0}
          color="bg-gradient-to-r from-pink-500 to-pink-600"
        />
        <StatCard
          icon={Layers}
          label="Services"
          value={stats?.services || 0}
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
        />
        <StatCard
          icon={Mail}
          label="Messages"
          value={stats?.messages?.total || 0}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Unread"
          value={stats?.messages?.unread || 0}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
        />
      </div>

      {/* Activity section */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {activity.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No recent activity. Start by adding some content!
            </div>
          ) : (
            activity.slice(0, 10).map((item, index) => (
              <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                <div className={`p-2 rounded-lg ${
                  item.type === 'project' ? 'bg-blue-100 text-blue-600' :
                  item.type === 'blog' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {item.type === 'project' ? <FolderKanban className="w-5 h-5" /> :
                   item.type === 'blog' ? <FileText className="w-5 h-5" /> :
                   <Mail className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 capitalize">{item.action}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-4 h-4" />
                  {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;