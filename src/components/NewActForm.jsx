"use client";
import { useState, useEffect } from "react";
import { FaTimes, FaMinus, FaPlus } from "react-icons/fa";

const NewReportForm = ({ isVisible, setIsVisible }) => {
  const [newReport, setNewReport] = useState({
    date: "",
    shift: "",
    tasks: [{ category: "", actionTaken: "", result: "" }],
  });

  const handleAddTask = () => {
    setNewReport({
      ...newReport,
      tasks: [
        ...newReport.tasks,
        { category: "", actionTaken: "", result: "" },
      ],
    });
  };

  //remove the last task was added in the form
  const handleRemoveTask = () => {
    setNewReport({
      ...newReport,
      tasks: newReport.tasks.slice(0, -1),
    });
  }

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = newReport.tasks.map((task, idx) =>
      idx === index ? { ...task, [field]: value } : task
    );
    setNewReport({ ...newReport, tasks: updatedTasks });
  };

  const handleSaveReport = async () => {
    const { date, shift, tasks } = newReport;


    const response = await fetch("http://172.17.40.200:8070/act/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportDate: date, shift, tasks }),
    });

    if (response.ok) {
      alert("Report saved successfully!");
      setIsVisible(false); // Hide the form after successful submission
      window.location.reload();
    } else {
      alert("There was an error saving the report.");
    }
  };

  return (
    <div
      id="newReportForm"
      className={`fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ${isVisible ? "block" : "hidden"
        }`}
    >
      <div className="bg-white p-8 rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Report</h2>
          <FaTimes
            className="text-red-600 cursor-pointer text-2xl"
            onClick={() => setIsVisible(false)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Date</label>
          <input
            type="date"
            value={newReport.date}
            onChange={(e) =>
              setNewReport({ ...newReport, date: e.target.value })
            }
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Shift</label>
          <select
            value={newReport.shift}
            onChange={(e) =>
              setNewReport({ ...newReport, shift: e.target.value })
            }
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Select shift</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div className="mb-4 max-h-64 overflow-y-auto">
          <div className="space-y-4">
            {newReport.tasks.map((task, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <select
                  name="category"
                  value={task.category}
                  onChange={(e) =>
                    handleTaskChange(index, "category", e.target.value)
                  }
                  className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {task.category === "Engineers" ?
                  <select
                    required
                    className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.actionTaken}
                    onChange={(e) =>
                      handleTaskChange(index, "actionTaken", e.target.value)
                    }
                  >
                    <option value="">Select A Name</option>
                    <option value="Shady Salah">Shady Salah</option>
                    <option value="Mina Fahmy">Mina Fahmy</option>
                    <option value="Ahmed Elkeyrdany">Ahmed Elkeyrdany</option>
                    <option value="Rabab Elsayed">Rabab Elsayed</option>
                    <option value="Bassem Alaa">Bassem Alaa</option>
                    <option value="Mohamed Alaa Elbana">Mohamed Alaa Elbana</option>
                    <option value="Ahmed Samir">Ahmed Samir</option>
                    <option value="Mahmoud Khaled">Mahmoud Khaled</option>
                  </select> : task.category === "IT-specialists" ? <select
                    required
                    className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.actionTaken}
                    onChange={(e) =>
                      handleTaskChange(index, "actionTaken", e.target.value)
                    }
                  >
                    <option value="">Select A Name</option>
                    <option value="Amr Nasser">Amr Nasser</option>
                    <option value="Islam Ibrahim">Islam Ibrahim</option>
                    <option value="Mohamed Alaa Youssef">Mohamed Alaa Youssef</option>
                    <option value="Mohamed Ali Ali">Mohamed Ali Ali</option>
                    <option value="El Sharkawy">El Sharkawy</option>
                  </select> : <input
                    type="text"
                    placeholder={task.category === "Engineers" ? "Name" : task.category === "IT-specialists" ? "Name" : "Task"}
                    value={task.actionTaken}
                    onChange={(e) =>
                      handleTaskChange(index, "actionTaken", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  />
                }
                {task.category === "Engineers" || task.category === "IT-specialists" ?
                  <select
                    required
                    className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={task.result}
                    onChange={(e) =>
                      handleTaskChange(index, "result", e.target.value)
                    }
                  >
                    <option value="">Select A Role</option>
                    <option value="Application Management and Integration">Application Management and Integration</option>
                    <option value="Infrastructure Management">Infrastructure Management</option>
                    <option value="User Support Department">User Support Department</option>
                    <option value="Wireless Device Management">Wireless Device Management</option>
                  </select> : <input
                    type="text"
                    placeholder={task.category === "Engineers" ? "Role" : task.category === "IT-specialists" ? "Role" : "Result"}
                    value={task.result}
                    onChange={(e) => handleTaskChange(index, "result", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    required
                  />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-5">
            <button
              onClick={handleAddTask}
              className="bg-green-400 hover:bg-green-500 p-3"
            >
              <FaPlus className="text-2xl cursor-pointer" />
            </button>
            <button
              onClick={handleRemoveTask}
              className="bg-red-400 hover:bg-red-500 p-3"
            >
              <FaMinus className="cursor-pointer text-2xl" />
            </button>
          </div>
          <button
            onClick={handleSaveReport}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewReportForm;
