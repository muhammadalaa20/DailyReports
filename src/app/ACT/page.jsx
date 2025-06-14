"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { FaRegSquarePlus } from "react-icons/fa6";
import NewReportForm from "../../components/NewActForm";
import { FaTrash, FaEdit } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";
import Image from "next/image";
import { IoSearchOutline } from "react-icons/io5";
import Link from "next/link";
import { HiLogout } from 'react-icons/hi'; // Assuming you're using react-icons (Lucida Icons)
import LogoutModal from "@/components/LogoutModel";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const printRef = useRef();
  const { authState, logout } = useAuth(); // Destructure authState and logout from AuthContext
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [groupedReports, setGroupedReports] = useState({}); // Grouped by month and year
  const [selectedDay, setSelectedDay] = useState(null); // Selected day
  const [selectedShift, setSelectedShift] = useState(null); // Selected shift
  const [tasks, setTasks] = useState([]); // Tasks for the selected shift
  const [showModal, setShowModal] = useState(false); // To toggle the modal visibility
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateCategory, setUpdateCategory] = useState("");
  const [updateActionTaken, setUpdateActionTaken] = useState("");
  const [updateResult, setUpdateResult] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [addCategory, setAddCategory] = useState("");
  const [addActionTaken, setAddActionTaken] = useState("");
  const [addResult, setAddResult] = useState("");
  const [newReport, setNewReport] = useState({
    day: "",
    shift: "",
    category: "",
    task: "",
  });
  
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // This effect ensures that the logic runs only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Now we know we are in the client-side
      setIsClient(true);
    }
  }, []);

  // Fetch and group reports by month and year
  useEffect(() => {

    if (!isClient) return; // Wait until we're sure it's client-side


    // Session check using authState from context
    if (!authState.role) {
      // If there's no token or role, redirect to the login page
      router.push('/');
      return;
    }

    if (authState.role !== 'act') {
      // If the user is not an ACT, redirect to the login page
      router.push('/');
      return;
    }

    console.log(authState.role)
    fetch("http://172.17.40.200:8070/act/reports")
      .then((res) => res.json())
      .then((data) => {
        const fixedDates = data.map((report) => {
          // Parse the date
          const date = new Date(report.report_date);

          // Add one day
          date.setDate(date.getDate() + 1);

          // Correct the overflow (e.g., if adding a day moves to the next month)
          const correctedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );

          return { ...report, report_date: correctedDate };
        });

        const groupedByMonth = fixedDates.reduce((acc, report) => {
          const monthYear = `${report.report_date.toLocaleString("default", {
            month: "long",
          })} - ${report.report_date.getFullYear()}`;
          acc[monthYear] = acc[monthYear] || [];
          acc[monthYear].push(report);
          return acc;
        }, {});

        // Sort months in descending order
        const sortedGroupedReports = Object.fromEntries(
          Object.entries(groupedByMonth).sort(
            ([a], [b]) => new Date(b) - new Date(a)
          )
        );

        setGroupedReports(sortedGroupedReports);
      })
      .catch((err) => console.error("Error fetching reports:", err));
  }, [isClient, authState.token, authState.role]);

  // Fetch tasks for a specific shift on a specific day
  const fetchTasks = async (day, shift) => {
    try {
      const response = await fetch(
        `http://172.17.40.200:8070/act/reports/${day}/${shift}`
      );
      const taskData = await response.json();
      setTasks(taskData);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Filter tasks based on search term
  const handleSearch = () => {
    const filtered = tasks.filter((task) =>
      task.action_taken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.result.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTasks(filtered);
  };

  // Handle day bar click
  const handleDayClick = (day) => {
    setSelectedDay(selectedDay === day ? null : day); // Toggle the selected day
    setSelectedShift(null); // Reset selected shift
    setTasks([]); // Clear tasks
  };

  // Handle shift click
  const handleShiftClick = (shift, day) => {
    setSelectedShift(selectedShift === shift ? null : shift); // Toggle the selected shift
    if (selectedShift !== shift) {
      fetchTasks(day, shift);
    } else {
      setTasks([]); // Clear tasks when toggled off
    }
  };

  const getShiftColor = (shift) => {
    const colors = {
      Morning: "bg-red-400",
      Evening: "bg-blue-300",
      Night: "bg-yellow-400",
    };
    return colors[shift] || "bg-gray-200";
  };

  // Handle new report modal form submission
  const handleReportSubmit = () => {
    setShowModal(false);
    // You can handle the API call here to add the report to the database
  };

  const handleDeleteClick = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await fetch(`http://172.17.40.200:8070/act/reports/${deleteTarget}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      window.location.reload(); // Refresh the page after deletion
    } catch (err) {
      console.error("Error deleting report:", err);
      setShowDeleteModal(false);
    }
  };


  // Function to open the modal and pre-fill the task details
  const openUpdateModal = (task) => {
    setSelectedTask(task.task_id);
    setUpdateCategory(task.category);
    setUpdateActionTaken(task.action_taken);
    setUpdateResult(task.result);
    setShowUpdateModal(true);
  };

  const confirmUpdate = async () => {
    try {
      const response = await fetch(`http://172.17.40.200:8070/act/tasks/${selectedTask}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: updateCategory,
          action_taken: updateActionTaken,
          result: updateResult,
        }),
      });

      if (response.ok) {
        alert("Task updated successfully");
        // Update the task list state if needed
        // You may want to update the tasks state in your component here to reflect the change
        setShowUpdateModal(false);  // Close the modal
        window.location.reload();
      } else {
        alert("Error updating task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task");
    }
  };


  const handleDeleteTaskClick = (task) => {
    setDeleteTaskTarget(task.task_id);
    setShowDeleteTaskModal(true);
  };

  // Function to delete a task
  const deleteTask = async () => {

    try {
      const response = await fetch(`http://172.17.40.200:8070/act/tasks/${deleteTaskTarget}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Task deleted successfully");

        // Update the tasks state to remove the deleted task
        setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== task.task_id));
        window.location.reload();
      } else {
        alert("Error deleting task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task");
    }
  };

  // Handle print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML; // Get the content inside the ref
    const originalContent = document.body.innerHTML; // Save the original content

    document.body.innerHTML = printContent; // Replace the body content with the ref content
    window.print(); // Trigger the print dialog
    document.body.innerHTML = originalContent; // Restore the original content
    window.location.reload(); // Reload to restore JavaScript event listeners
  };

  const openAddTaskModal = (tasks) => {
    console.log("Opening Add Task Modal for Report ID:", tasks[0].report_id);
    setShowAddTaskModal(true);
    setSelectedReportId(tasks[0].report_id);
  };


  const confirmAddTask = async () => {
    console.log("Adding Task for Report ID:", selectedReportId);
    const task = {
      report_id: selectedReportId,
      category: addCategory,
      action_taken: addActionTaken,
      result: addResult
    };
    console.log(task)
    const response = await fetch("http://172.17.40.200:8070/act/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      alert("Task added successfully");
      setShowAddTaskModal(false);
      window.location.reload();
      // Optionally, refresh the tasks list to reflect the new task
      // You can re-fetch the tasks or update the state here
    } else {
      alert("Error adding task");
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // Close modal and redirect to home page
    setIsModalOpen(false);
    logout(); // Use the logout method from AuthContext
    router.push('/'); // Redirect to home after logout
  };

  const username = authState.name; // Use the name from authState context

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="bg-slate-900 text-white p-4  flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/report.svg" alt="Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold">ACT Reports</h1>
        </div>
        {/* Add new Report form pop-up button */}
        <div className="flex items-center gap-2">
          <h1 className="text-md font-bold mr-2">Welcome, <span className="text-blue-500">{username}</span></h1>
          <FaRegSquarePlus
            className="w-8 h-8 cursor-pointer text-white hover:scale-105 hover:text-blue-500 transition-all duration-300 ease-in-out"
            onClick={() => setIsVisible(true)}
          />
          <div>
            {/* Logout Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-lg text-white hover:text-red-500"
            >
              <HiLogout size={24} />
            </button>

            {/* Confirmation Modal */}
            <LogoutModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </nav>

      <NewReportForm isVisible={isVisible} setIsVisible={setIsVisible} />

      {/* Search Bar */}
      <div className="w-full">
        <div className="flex w-full items-center justify-center pt-10">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="border border-blue-300 rounded-md p-3 focus:outline-none md:w-1/3 w-2/3 hover:border-black focus:border-black transition-all duration-300 ease-in-out"
          />
          <button className="p-4 border border-blue-300 bg-blue-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 ease-in-out"
            onClick={handleSearch}><IoSearchOutline /></button>
        </div>
        <p className="text-center pt-2 text-sm text-slate-500">Search by <Link href="/category" className="underline text-black hover:text-blue-500">Category</Link> </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this report?</p>
            <div className="flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2 min-w-20"
                onClick={confirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Modal */}
      {showDeleteTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this Task?</p>
            <div className="flex justify-end">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2 min-w-20"
                onClick={deleteTask}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowDeleteTaskModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Update Task</h2>
            <div className="mb-4">
              <label className="block mb-2">Category</label>
              <select
                name="category"
                value={updateCategory}
                onChange={(e) => setUpdateCategory(e.target.value)
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Category</option>
                <option value="Engineers">Engineers</option>
                <option value="IT-specialists">IT-specialists</option>
                <option value="PC">PC</option>
                <option value="Printer">Printer</option>
                <option value="VM3">VM3</option>
                <option value="PDA">PDA</option>
                <option value="RDT">RDT</option>
                <option value="Network">Network</option>
                <option value="OCR">OCR</option>
                <option value="ERP">ERP</option>
                <option value="CATOS">CATOS</option>
                <option value="EDI">EDI</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="mb-4">
              {updateCategory === "Engineers" || updateCategory === "IT-specialists" ? <label className="block mb-2">Name</label> : <label className="block mb-2">Task</label>}
              <input
                type="text"
                value={updateActionTaken}
                onChange={(e) => setUpdateActionTaken(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              {updateCategory === "Engineers" || updateCategory === "IT-specialists" ? <label className="block mb-2">Role</label> : <label className="block mb-2">Result</label>}
              <input
                type="text"
                value={updateResult}
                onChange={(e) => setUpdateResult(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={confirmUpdate}
              >
                Update
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add New Report */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Report</h2>
            <div>
              <label className="block mb-2">Day</label>
              <input
                type="date"
                value={newReport.day}
                onChange={(e) =>
                  setNewReport({ ...newReport, day: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block mb-2">Shift</label>
              <select
                value={newReport.shift}
                onChange={(e) =>
                  setNewReport({ ...newReport, shift: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
              <label className="block mb-2">Category</label>
              <input
                type="text"
                value={newReport.category}
                onChange={(e) =>
                  setNewReport({ ...newReport, category: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              />
              <label className="block mb-2">Task</label>
              <textarea
                value={newReport.task}
                onChange={(e) =>
                  setNewReport({ ...newReport, task: e.target.value })
                }
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={handleReportSubmit}
              >
                Submit
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and display grouped reports */}
      {Object.entries(groupedReports).map(([monthYear, reports]) => {
        // Filter reports based on search term
        const filteredReports = reports.filter(
          (report) =>
            (report.action_taken && report.action_taken.toLowerCase().includes(searchTerm)) ||
            (report.result && report.result.toLowerCase().includes(searchTerm))
        );

        // If no reports match the search, skip this month
        if (filteredReports.length === 0) return null;

        return (
          <div key={monthYear} className="mt-4">
            {/* Month Title */}
            <div className="flex items-center mb-4 gap-2">
              <Image src="/calen.svg" alt="Calendar" width={40} height={40} />
              <h2 className="text-2xl font-bold">{monthYear.toUpperCase()}</h2>
            </div>


            {/* Day Bars */}
            {Object.entries(
              filteredReports.reduce((acc, report) => {
                const date = report.report_date.toISOString().split("T")[0];
                acc[date] = acc[date] || [];
                acc[date].push(report);
                return acc;
              }, {})

            ).map(([day, dayReports]) => (
              <div key={day} className="bg-white shadow rounded mb-2">
                {/* Day Bar */}
                <motion.div
                  className={`p-2 cursor-pointer flex justify-between items-center hover:bg-blue-500 ${selectedDay === day ? "bg-blue-200" : "bg-blue-400 text-white"
                    }`}
                  onClick={() => handleDayClick(day)}
                >
                  <h3 className="text-lg font-bold">{day}</h3>
                  <button
                    className="p-2 text-white rounded hover:text-red-500 hover:scale-105 transition-all duration-300 ease-in-out"
                    onClick={() => handleDeleteClick(day)}
                  >
                    <FaTrash className="w-6 h-6" />
                  </button>
                </motion.div>

                {/* Shifts */}
                {selectedDay === day && (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-5">
                      {["Morning", "Evening", "Night"].map((shift) => (
                        <motion.div
                          key={shift}
                          className={`p-4 rounded cursor-pointer ${getShiftColor(
                            shift
                          )} ${selectedShift === shift ? "border-2 border-black" : ""
                            }`}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleShiftClick(shift, day)}
                        >
                          <h4 className="font-bold min-w-24 text-center">{shift} Shift</h4>
                        </motion.div>
                      ))}
                    </div>
                    {/* Print Button */}
                    <button
                      className=" text-black text-3xl hover:text-blue-600 hover:scale-105 rounded transition-all duration-300 ease-in-out"
                      onClick={handlePrint}
                    >
                      <FiPrinter />
                    </button>
                  </div>
                )}


                {/* Tasks */}
                {selectedShift && selectedDay === day && (
                  <div className="mt-4 bg-gray-50 p-8 rounded shadow">
                    <div ref={printRef}>
                      <div className="mt-4 mb-6 w-full flex items-center justify-between border-b-2 border-black pb-5">
                        <Image src="/loading.png" alt="Logo" width={100} height={50} />
                        <div>
                          <h1 className="text-start text-sm font-bold">
                            {selectedShift} Shift Report
                          </h1>
                          <p className="text-start text-sm font-bold">Date: {selectedDay}</p>
                          <p className="text-start text-sm font-bold">ACT-IT Department</p>
                        </div>
                      </div>
                      {tasks.length > 0 ? (
                        Object.entries(
                          tasks.reduce((acc, task) => {
                            acc[task.category] = acc[task.category] || [];
                            acc[task.category].push(task);
                            return acc;
                          }, {})
                        )
                          // Sort the categories: "Engineers" first, "IT-specialists" second, others afterward
                          .sort(([categoryA], [categoryB]) => {
                            const order = ["Engineers", "IT-specialists"];
                            if (order.indexOf(categoryA) !== -1 && order.indexOf(categoryB) === -1) {
                              return -1; // "Engineers" and "IT-specialists" go first
                            }
                            if (order.indexOf(categoryB) !== -1 && order.indexOf(categoryA) === -1) {
                              return 1;
                            }
                            return categoryA.localeCompare(categoryB); // Alphabetical sorting for others
                          }).map(([category, categoryTasks]) => (
                            <div key={category} className="my-2 print-block">
                              <h5 className="font-bold mb-1">{category}</h5>
                              <table className="table-auto w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th
                                      className={`${category === "Engineers"
                                        ? "bg-yellow-200"
                                        : category === "IT-specialists"
                                          ? "bg-green-200"
                                          : "bg-blue-200"
                                        } border border-black px-4 py-1 w-1/2 break-words`}
                                    >
                                      {category === "Engineers" || category === "IT-specialists"
                                        ? "Name"
                                        : "Task"}
                                    </th>
                                    <th
                                      className={`${category === "Engineers"
                                        ? "bg-yellow-200"
                                        : category === "IT-specialists"
                                          ? "bg-green-200"
                                          : "bg-blue-200"
                                        } border border-black px-4 py-1 w-1/2 break-words`}
                                    >
                                      {category === "Engineers" || category === "IT-specialists"
                                        ? "Role"
                                        : "Result"}
                                    </th>
                                    <th>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {categoryTasks.map((task) => (
                                    <tr key={task.id} className="task-row relative hover:bg-gray-100">
                                      <td className="border border-black px-4 py-1 w-1/2 text-center break-words">
                                        {task.action_taken}
                                      </td>
                                      <td className="border border-black px-4 py-1 w-1/2 text-center break-words">
                                        {task.result}
                                      </td>
                                      {/* The button will be shown on hover */}
                                      <td className="absolute flex flex-col items-center justify-center space-y-1 -right-6 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100">
                                        <button
                                          onClick={() => openUpdateModal(task)} // Assuming openUpdateModal is defined elsewhere
                                        >
                                          <FaEdit className="h-4 w-4 hover:text-blue-500" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTaskClick(task)} // Assuming openUpdateModal is defined elsewhere
                                        >
                                          <FaTrash className="h-4 w-4 hover:text-red-500" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))
                      ) : (
                        <p>No tasks available for this shift.</p>
                      )}
                    </div>
                    <div className="flex justify-end items-center mt-4">
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 hover:scale-105 transition duration-300"
                        onClick={() => openAddTaskModal(tasks)} // This opens the modal to add a new task
                      >
                        Add Task
                      </button>
                    </div>
                    {showAddTaskModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                          <h2 className="text-xl font-bold mb-4">Add New Task</h2>

                          {/* Add Task Form */}
                          <div className="mb-4">
                            <label className="block mb-2">Category</label>
                            <select
                              value={addCategory}
                              onChange={(e) => setAddCategory(e.target.value)}
                              className="w-full p-2 border rounded"
                              required
                            >
                              <option value="">Category</option>
                              <option value="Engineers">Engineers</option>
                              <option value="IT-specialists">IT-specialists</option>
                              <option value="PC">PC</option>
                              <option value="Printer">Printer</option>
                              <option value="VM3">VM3</option>
                              <option value="PDA">PDA</option>
                              <option value="RDT">RDT</option>
                              <option value="Network">Network</option>
                              <option value="OCR">OCR</option>
                              <option value="ERP">ERP</option>
                              <option value="CATOS">CATOS</option>
                              <option value="EDI">EDI</option>
                              <option value="Others">Others</option>
                            </select>
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2">{addCategory === "Engineers" || addCategory === "IT-specialists" ? "Name" : "Task"}</label>
                            <input
                              type="text"
                              value={addActionTaken}
                              onChange={(e) => setAddActionTaken(e.target.value)}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block mb-2">{addCategory === "Engineers" || addCategory === "IT-specialists" ? "Role" : "Result"}</label>
                            <input
                              type="text"
                              value={addResult}
                              onChange={(e) => setAddResult(e.target.value)}
                              className="w-full p-2 border rounded"
                              required
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                              onClick={confirmAddTask} // Function to add task
                            >
                              Add Task
                            </button>
                            <button
                              className="bg-gray-500 text-white px-4 py-2 rounded"
                              onClick={() => setShowAddTaskModal(false)} // Close modal
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
