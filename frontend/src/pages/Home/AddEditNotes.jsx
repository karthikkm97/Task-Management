/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AddEditNotes = ({ noteData, type, onClose, getAllNotes }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [error, setError] = useState(null); // Fixed destructuring issue
  const [priority, setPriority] = useState(noteData?.priority || 1);
  const [status, setStatus] = useState(noteData?.status || "Pending");
  const [startTime, setStartTime] = useState(noteData?.startTime || "");
  const [endTime, setEndTime] = useState(noteData?.endTime || "");

  // Sync form fields when noteData changes (if editing)
  useEffect(() => {
    if (type === "edit" && noteData) {
      setTitle(noteData.title);
      setPriority(noteData.priority);
      setStatus(noteData.status);
      setStartTime(formatDateForInput(noteData.startTime));
      setEndTime(formatDateForInput(noteData.endTime));
    }
  }, [type, noteData]);

  // Helper function to format the date for input type="datetime-local"
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset); // Convert to local timezone
    return date.toISOString().slice(0, 16); // Return in "YYYY-MM-DDTHH:mm" format
  };

  // Toggle task status between "Pending" and "Finished"
  const toggleStatus = () => {
    setStatus((prevStatus) => (prevStatus === "Pending" ? "Finished" : "Pending"));
  };

  // Increment and Decrement priority
  const incrementPriority = () => {
    if (priority < 5) setPriority(priority + 1);
  };

  const decrementPriority = () => {
    if (priority > 1) setPriority(priority - 1);
  };

  // Add note
  const addNewNotes = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        priority,
        status,
        startTime: new Date(startTime).toISOString(), // Convert to ISO string
        endTime: new Date(endTime).toISOString(), // Convert to ISO string
      });
      if (response.data && response.data.note) {
        alert("Note Added Successfully");
        getAllNotes();
        onClose(); // Close the modal and show navbar
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
  };

  // Edit note
  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/edit-note/" + noteId, {
        title,
        priority,
        status,
        startTime: new Date(startTime).toISOString(), // Convert to ISO string
        endTime: new Date(endTime).toISOString(), // Convert to ISO string
      });

      if (response.data && response.data.note) {
        alert("Note Updated Successfully");
        getAllNotes();
        onClose(); // Close the modal and show navbar
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }

    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNotes();
    }
  };

  const toggleDialog = () => {
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-60">
        <h2 className="text-lg font-bold mb-4 text-black">
          {type === "edit" ? "Edit Task" : "Add New Task"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-black" htmlFor="taskTitle">
              Task Title
            </label>
            <input
              id="taskTitle"
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />
          </div>

          {/* Priority Input */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-black" htmlFor="priority">
              Priority
            </label>
            <div className="flex items-center gap-4 p-2 justify-center">
              <button
                onClick={decrementPriority}
                className="px-3 py-1 border rounded text-sm text-black"
              >
                -
              </button>
              <input
                id="priority"
                type="text"
                value={priority}
                readOnly
                className="w-12 border rounded text-center px-3 py-2 text-sm text-black"
              />
              <button
                onClick={incrementPriority}
                className="px-3 py-1 border rounded text-sm text-black"
              >
                +
              </button>
            </div>
          </div>

          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-black">Status</label>
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={toggleStatus}
            >
              <span className={`text-base font-bold ${status === "Finished" ? "text-gray-600" : "text-red-400"}`}>
                Pending
              </span>

              <div className={`w-16 h-8 flex items-center p-1 bg-gray-300 rounded-full transition-all duration-300`}>
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${status === "Pending" ? "transform translate-x-8" : ""}`}
                ></div>
              </div>

              <span className={`text-base font-bold ${status === "Pending" ? "text-gray-600" : "text-green-400"}`}>
                Finished
              </span>
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-black" htmlFor="startTime">
              Start Time
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-black" htmlFor="endTime">
              End Time
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 border rounded text-sm text-black" onClick={toggleDialog}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
            onClick={handleAddNote}
          >
            {type === "edit" ? "Update Task" : "Add Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditNotes;
