import { useEffect, useState } from "react";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstance";
import Navbar from "../../components/Navbar/Navbar";
import AddEditNotes from "../Home/AddEditNotes";
import {useNavigate } from "react-router-dom"

const TaskList = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [tasks, setTasks] = useState([]);
  const [viewType, setViewType] = useState("cards");
  const [sortCriteria, setSortCriteria] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
const navigate = useNavigate()
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setTasks(response.data.notes);
      }
    } catch (error) {
      alert("You need to be logged in to access this page");
      navigate("/login");
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await axiosInstance.delete(`/delete-note/${noteId}`);
      if (response.data && !response.data.error) {
        alert("Note Deleted Successfully");
        setTasks((prevTasks) =>
          prevTasks.filter((note) => note._id !== noteId)
        );
      }
    } catch (error) {
      alert("Error deleting note. Please try again.");
    }
  };

  const handleSort = (criteria) => {
    if (!criteria) {
      // Reset to original state by re-fetching the data
      getAllNotes();
      setSortCriteria(""); // Clear the selected criteria
      return;
    }

    const sortedTasks = [...tasks].sort((a, b) => {
      if (criteria === "startTime") {
        return new Date(a.startTime) - new Date(b.startTime);
      } else if (criteria === "endTime") {
        return new Date(a.endTime) - new Date(b.endTime);
      } else if (criteria === "priority") {
        return a.priority - b.priority; // Ascending priority
      }
      return 0;
    });

    setSortCriteria(criteria); // Save the selected criteria
    setTasks(sortedTasks); // Update tasks with sorted data
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      (priorityFilter === "" || task.priority === parseInt(priorityFilter)) &&
      (statusFilter === "" || task.status === statusFilter)
    );
  });

  const handleEdit = (task) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: task });
  };

  useEffect(() => {
    getAllNotes();
  }, []);

  return (
    <div className="p-6">
      <Navbar />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task List</h1>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border border-gray-300 rounded-full text-sm"
            onClick={() =>
              setViewType(viewType === "table" ? "cards" : "table")
            }
          >
            Toggle View
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm"
            onClick={() => {
              setOpenAddEditModal({ isShown: true, type: "add", data: null });
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.2)" },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          getAllNotes={getAllNotes}
        />
      </Modal>

      <div className="flex justify-end gap-2 mb-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded text-sm"
          value={sortCriteria}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="startTime">Start Time: ASC</option>
          <option value="endTime">End Time: ASC</option>
          <option value="priority">Priority: ASC</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Priority</option>
          {[1, 2, 3, 4, 5].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option value="Pending">Pending</option>
          <option value="Finished">Finished</option>
        </select>
      </div>

      {/* Displaying No Data Available Message */}
      {filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 mt-4">No data available</div>
      ) : viewType === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task, index) => (
            <div
              key={task._id}
              className="p-4 bg-white border rounded shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm text-gray-500">
                    Task ID: T-{(index + 1).toString().padStart(4, "0")}
                  </div>
                  <div className="font-medium text-lg">{task.title}</div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    task.status === "Pending"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {task.status}
                </span>
              </div>
              <div className="text-sm">Priority: {task.priority}</div>
              <div className="mt-2 text-sm text-gray-500">
                <div>Start: {formatDate(task.startTime)}</div>
                <div>End: {formatDate(task.endTime)}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  onClick={() => handleEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 border border-red-500 text-red-500 rounded text-sm"
                  onClick={() => deleteNote(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Task ID</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Priority</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Start Time</th>
                <th className="p-2 text-left">End Time</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => (
                <tr key={task._id} className="border-b">
                  <td className="p-2">
                    T-{(index + 1).toString().padStart(4, "0")}
                  </td>
                  <td className="p-2">{task.title}</td>
                  <td className="p-2">{task.priority}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === "Pending"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="p-2">{formatDate(task.startTime)}</td>
                  <td className="p-2">{formatDate(task.endTime)}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 border border-red-500 text-red-500 rounded text-sm"
                        onClick={() => deleteNote(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskList;
