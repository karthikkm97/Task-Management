import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import axiosInstance from "../../utils/axiosInstance";
import {useNavigate } from "react-router-dom"


const Home = () => {
  const [stats, setStats] = useState({
    totalCount: 0,
    percentCompleted: 0,
    percentPending: 0,
    averageCompletionTime: 0,
    pendingCount: 0,
    totalLapsedTime: 0,
    totalBalanceTime: 0,
    pendingGroupedByPriority: {},
  });
  const [tasks, setTasks] = useState([]);
const navigate = useNavigate()
  // Fetch stats from the backend
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/stats");
      if (response.data && response.data.userStats) {
        const userStats = response.data.userStats;

        setStats({
          totalCount: userStats.totalTasks || 0,
          percentCompleted: userStats.percentCompleted || 0,
          percentPending: userStats.percentPending || 0,
          averageCompletionTime: userStats.averageCompletionTime || 0,
          pendingCount: userStats.pendingTasks || 0,
          totalLapsedTime: Object.values(userStats.pendingGroupedByPriority || {}).reduce(
            (sum, priority) => sum + (priority.lapsedTime || 0),
            0
          ),
          totalBalanceTime: Object.values(userStats.pendingGroupedByPriority || {}).reduce(
            (sum, priority) => sum + (priority.balanceTime || 0),
            0
          ),
          pendingGroupedByPriority: userStats.pendingGroupedByPriority || {},
        });

        setTasks(response.data.notes || []);
      }
    } catch (error) {
      alert("You need to be logged in to access this page");
      navigate("/login");
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalCount}</div>
            <p className="text-sm text-gray-500">Total tasks</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">{stats.percentCompleted.toFixed(2)}%</div>
            <p className="text-sm text-gray-500">Tasks completed</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">{stats.percentPending.toFixed(2)}%</div>
            <p className="text-sm text-gray-500">Tasks pending</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.averageCompletionTime.toFixed(2)} hrs
            </div>
            <p className="text-sm text-gray-500">Avg. time per completed task</p>
          </div>
        </div>
      </div>

      {/* Pending Tasks Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pending Task Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">{stats.pendingCount}</div>
            <p className="text-sm text-gray-500">Pending tasks</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalLapsedTime.toFixed(2)} hrs
            </div>
            <p className="text-sm text-gray-500">Total time lapsed</p>
          </div>
          <div className="p-4 bg-white shadow rounded">
            <div className="text-3xl font-bold text-indigo-600">
              {stats.totalBalanceTime.toFixed(2)} hrs
            </div>
            <p className="text-sm text-gray-500">Total time to finish</p>
          </div>
        </div>

       {/* Pending Tasks by Priority Table */}
<div className="bg-white shadow rounded overflow-hidden">
  <table className="w-full table-auto">
    <thead className="bg-gray-200">
      <tr>
        <th className="p-4 text-left">Task Priority</th>
        <th className="p-4 text-left">Pending Tasks</th>
        <th className="p-4 text-left">Lapsed Time (hrs)</th>
        <th className="p-4 text-left">Time to Finish (hrs)</th>
      </tr>
    </thead>
    <tbody>
  {Object.keys(stats.pendingGroupedByPriority).map((priority) => {
    const { PendingTask, lapsedTime, balanceTime } =
      stats.pendingGroupedByPriority[priority] || {};
    return (
      <tr key={priority} className="border-b">
        <td className="p-4">{priority}</td>
        <td className="p-4">{PendingTask || 0}</td>
        <td className="p-4">{(lapsedTime || 0).toFixed(2)} hrs</td>
        <td className="p-4">{(balanceTime || 0).toFixed(2)} hrs</td>
      </tr>
    );
  })}
</tbody>

  </table>
</div>
      </div>
    </div>
  );
};

export default Home;
