'use client';
import { MoveLeft, PrinterIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Category() {
  const [category, setCategory] = useState('');
  const [categoryTasks, setCategoryTasks] = useState([]);
  const [visibleTasks, setVisibleTasks] = useState(30);  // Number of tasks visible initially
  const [username, setUsername] = useState(null);
  const reportRef = useRef();

  const { authState } = useAuth();  // Get the authState from context

  useEffect(() => {
    // Ensure that the code runs only in the client (browser)
    if (typeof window !== 'undefined') {
      // Now using the username from the authState in context
      setUsername(authState.name);
      console.log(authState.name); // Logs the username if available
    }
  }, [authState]); // Run when authState changes


  // Fetch the category tasks
  const showReport = (e) => {
    const category = e.target.value;
    setCategory(category);
    setVisibleTasks(30);  // Reset to show the first 30 tasks when category changes
    fetch(`http://172.17.40.200:8070/api/tasks/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setCategoryTasks(data);
        console.log('data:', data);
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  };

  const handlePrint = () => {
    const printContent = reportRef.current.innerHTML; // Get the content inside the ref
    const originalContent = document.body.innerHTML; // Save the original content

    document.body.innerHTML = printContent; // Replace the body content with the ref content
    window.print(); // Trigger the print dialog
    document.body.innerHTML = originalContent; // Restore the original content
    window.location.reload(); // Reload to restore JavaScript event listeners
  };

  const loadMoreTasks = () => {
    setVisibleTasks(visibleTasks + 30); // Load 30 more tasks
  };



  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex justify-between items-center p-4 px-8 bg-slate-900">
        <div className="flex gap-4 items-center">
          <Link href="/" className="flex items-center">
            <MoveLeft className="text-black h-6 w-6 hover:cursor-pointer p-1 bg-white rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300" />
          </Link>
          <h1 className=" text-2xl font-bold text-white">CATEGORY REPORT</h1>
        </div>
        <div className="flex gap-4 items-center">
          <select
            name="category"
            id="category"
            value={category}
            className="p-2 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={showReport}
            required
          >
            <option value="">Select</option>
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
      </div>
      <div className={`flex flex-col gap-4 p-4 ${category === '' || categoryTasks.length === 0 ? 'my-auto' : ''}`}>
        {category === '' ? (
          <p className="w-full text-center text-red-400 text-2xl align-middle ">{username}, Please select a category first</p>
        ) : categoryTasks.length === 0 ? (
          <p className="w-full text-center text-red-400 text-2xl align-middle ">No tasks available for this category.</p>
        ) : (
          <div ref={reportRef}>
            {Object.entries(
              categoryTasks
                .reduce((acc, task) => {
                  acc[task.category] = acc[task.category] || [];
                  acc[task.category].push(task);
                  return acc;
                }, {})
            )
              .sort(([categoryA], [categoryB]) => {
                const order = ['Engineers', 'IT-specialists'];
                if (order.indexOf(categoryA) !== -1 && order.indexOf(categoryB) === -1) {
                  return -1; // "Engineers" and "IT-specialists" go first
                }
                if (order.indexOf(categoryB) !== -1 && order.indexOf(categoryA) === -1) {
                  return 1;
                }
                return categoryA.localeCompare(categoryB); // Alphabetical sorting for others
              })
              .map(([category, categoryTasks]) => (
                <div key={category} className="my-2 print-block py-4 px-2">
                  <div className="flex justify-between items-center mb-10 pb-4 border-b border-black">
                    <div>
                      <Image src="/loading.png" alt="Logo" width={100} height={50} />
                    </div>
                    <div className="flex flex-col">
                      <h5 className="font-bold text-sm w-full text-start">{category} Report</h5>
                      <p className="text-start text-sm font-bold">DCT-IT Department</p>
                      {/* number of tasks fetched */}
                      <p className="text-start text-sm font-bold">Number of tasks: {categoryTasks.length}</p>
                    </div>
                  </div>
                  <table className="table-auto w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="px-4 py-1 md:w-1/12 w-1/5"></th>
                        <th
                          className={`${category === 'Engineers'
                            ? 'bg-yellow-200'
                            : category === 'IT-specialists'
                              ? 'bg-green-200'
                              : 'bg-blue-200'
                            } border border-black px-4 py-1 w-5/12 break-words`}
                        >
                          {category === 'Engineers' || category === 'IT-specialists' ? 'Name' : 'Task'}
                        </th>
                        <th
                          className={`${category === 'Engineers'
                            ? 'bg-yellow-200'
                            : category === 'IT-specialists'
                              ? 'bg-green-200'
                              : 'bg-blue-200'
                            } border border-black px-4 py-1 w-5/12 break-words`}
                        >
                          {category === 'Engineers' || category === 'IT-specialists' ? 'Role' : 'Result'}
                        </th>
                        <th className="border border-black px-4 py-1 w-1/12 break-words bg-red-200">
                          Source
                        </th>
                        <th className="border border-black px-4 py-1 w-1/12  text-nowrap bg-teal-200">
                          Report Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryTasks.slice(0, visibleTasks).map((task, index) => (
                        <tr key={task.report_id} className="task-row relative hover:bg-gray-100">
                          <td className="border border-black px-4 py-1 md:w-1/12 w-5/12 text-center font-bold break-words">
                            {index + 1}
                          </td>
                          <td className="border border-black px-4 py-1 w-5/12 text-center break-words">
                            {task.action_taken}
                          </td>
                          <td className="border border-black px-4 py-1 w-1/12 text-center break-words">
                            {task.result}
                          </td>
                          <td className="border border-black px-4 py-1 w-1/12 text-center break-words">
                            {task.source}
                          </td>
                          {/* Add the Report Date Column */}
                          <td className="border  border-black px-4 py-1 w-2/5 text-center break-words">
                            {task.report_date ? new Date(task.report_date).toLocaleDateString('en-CA') : 'N/A'} {/* Display report date if available */}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              ))}
            {visibleTasks < categoryTasks.length && (
              <button
                onClick={loadMoreTasks}
                className="mt-4 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
