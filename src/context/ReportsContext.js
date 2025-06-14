// reportsContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Create Reports Context
const ReportsContext = createContext();

// ReportsProvider component that will wrap the application
export const ReportsProvider = ({ children }) => {
  const [groupedReports, setGroupedReports] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://172.17.40.200:8070/dct/reports")
      .then((res) => res.json())
      .then((data) => {
        const fixedDates = data.map((report) => {
          const date = new Date(report.report_date);
          date.setDate(date.getDate() + 1);
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

        const sortedGroupedReports = Object.fromEntries(
          Object.entries(groupedByMonth).sort(
            ([a], [b]) => new Date(b) - new Date(a)
          )
        );

        setGroupedReports(sortedGroupedReports);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reports:", err);
        setIsLoading(false);
      });
  }, []); // Dependency array could include authState or any other necessary dependencies

  return (
    <ReportsContext.Provider value={{ groupedReports, isLoading }}>
      {children}
    </ReportsContext.Provider>
  );
};

// Custom hook to use the Reports Context
export const useReports = () => {
  return useContext(ReportsContext);
};
