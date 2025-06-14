const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require('bcrypt');
// pings start
const axios = require('axios');
const ping = require('ping');
const accesspoints = require('./accesspoints.json');

const act_devicesFile = './act_devices.json';
const act_accesspoints = require('./act_accesspoints.json');
const devicesFile = './devices.json';
const bodyParser = require('body-parser');
const fs = require('fs');
const { spawn } = require('child_process');
const app = express();
app.use(bodyParser.json());
// pings end

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://172.17.40.200:8050',
      'http://172.17.40.200:8060'
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);  // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'), false);  // Reject the request
    }
  }
}));
app.use(express.json());
app.use(express.static(__dirname));

// MySQL connection
const db = mysql.createPool({
  host: "localhost",
  port: 6666,
  user: "root",
  password: "Mm0123456789.", 
  database: "DailyReports",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,  // Timeout after 10 seconds
});

// Pings Functions start
// Loading Devices from the json File
const loadDevices = () => {
  const data = fs.readFileSync(devicesFile, 'utf-8')
  return JSON.parse(data)
}
// Overwrite data
const saveDevices = devices => {
  fs.writeFileSync(devicesFile, JSON.stringify(devices, null, 2), 'utf-8')
}
// Route to Devices
app.get('/devices', (req, res) => {
  const devices = loadDevices()
  res.json(devices)
})

// Route to specific Device
app.put('/devices/:id/select', (req, res) => {
  const devices = loadDevices()
  const deviceId = parseInt(req.params.id, 10)

  const device = devices.find(d => d.id === deviceId)
  if (device) {
    device.selected = req.body.selected
    saveDevices(devices)
    res.json({ message: 'Device updated successfully.' })
  } else {
    res.status(404).json({ error: 'Device not found.' })
  }
})


// Update Ip address
app.put('/devices/:id/ipaddress', (req, res) => {
  const devices = loadDevices();
  const deviceId = parseInt(req.params.id, 10);

  const device = devices.find((d) => d.id === deviceId);
  if (device) {
    device.ip = req.body.ip; // Expecting the updated IP address as `ip` in the request body
    saveDevices(devices);
    res.json({ message: 'Device IP address updated successfully.' });
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});

// Pinging Devices
app.get('/devices/status', async (req, res) => {
  try {
    const devices = loadDevices();

    // Filter devices to include only those with selected: true
    const selectedDevices = devices.filter((device) => device.selected);
    // Ping each selected device to update its status
    const results = await Promise.all(
      selectedDevices.map(async (device) => {
        const response = await ping.promise.probe(device.ip);
        return {
          target: device, // Include the original device object
          alive: response.alive,
          time: response.time, // Include round-trip time if available
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving device statuses' });
  }
});

app.get('/ping-status', async (req, res) => {
    try {
      // Ping all targets and collect results
      const results = await Promise.all(
        accesspoints.map(async (target) => {
          const response = await ping.promise.probe(target.ip, { timeout: 0.5 });
          return { target, alive: response.alive , time: response.time};
      }));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Error during ping' });
    }
  }
);


// update ACT
app.get('/ping-status-act', async (req, res) => {
  try {
    // Ping all targets and collect results
    const results = await Promise.all(
      act_accesspoints.map(async (target) => {
        const response = await ping.promise.probe(target.ip, { timeout: 0.5 });
        return { target, alive: response.alive , time: response.time};
    }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error during ping' });
  }
}
);


// Update ACT part
const act_loadDevices = () => {
  const act_data = fs.readFileSync(act_devicesFile, 'utf-8')
  return JSON.parse(act_data)
}
// Overwrite data
const act_saveDevices = act_devices => {
  fs.writeFileSync(act_devicesFile, JSON.stringify(act_devices, null, 2), 'utf-8')
}

// Route to Devices
app.get('/devices_act', (req, res) => {
  const act_devices = act_loadDevices()
  res.json(act_devices)
})
app.put('/devices_act/:id/select', (req, res) => {
  const act_devices = act_loadDevices()
  const deviceId = parseInt(req.params.id, 10)

  const device = act_devices.find(d => d.id === deviceId)
  if (device) {
    device.selected = req.body.selected
    act_saveDevices(act_devices)
    res.json({ message: 'Device updated successfully.' })
  } else {
    res.status(404).json({ error: 'Device not found.' })
  }
})

// Update Ip address
app.put('/devices_act/:id/ipaddress', (req, res) => {
  const act_devices = loadDevices();
  const deviceId = parseInt(req.params.id, 10);

  const device = act_devices.find((d) => d.id === deviceId);
  if (device) {
    device.ip = req.body.ip; // Expecting the updated IP address as `ip` in the request body
    act_saveDevices(act_devices);
    res.json({ message: 'Device IP address updated successfully.' });
  } else {
    res.status(404).json({ error: 'Device not found.' });
  }
});

// Pinging Devices
app.get('/devices_act/status', async (req, res) => {
  try {
    const devices = act_loadDevices();

    // Filter devices to include only those with selected: true
    const selectedDevices = devices.filter((device) => device.selected);
    // Ping each selected device to update its status
    const results = await Promise.all(
      selectedDevices.map(async (device) => {
        const response = await ping.promise.probe(device.ip);
        return {
          target: device, // Include the original device object
          alive: response.alive,
          time: response.time, // Include round-trip time if available
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving device statuses' });
  }
});

// update ACT END






// Daily Report start
// dct: Fetch all reports (grouped by date and shift, ordered by date desc)
app.get("/dct/reports", (req, res) => {
  const query = `
    SELECT r.id, r.report_date, r.shift, t.category, t.action_taken, t.result
    FROM reports_dct r
    LEFT JOIN tasks_dct t ON r.id = t.report_id
    ORDER BY r.report_date DESC, FIELD(r.shift, 'Morning', 'Evening', 'Night')
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// dct to fetch data for a specific shift on a specific day
app.get("/dct/reports/:date/:shift", (req, res) => {
  const { date, shift } = req.params;
  const query = `
    SELECT r.id AS report_id, r.report_date, r.shift, t.id AS task_id, t.category, t.action_taken, t.result
    FROM reports_dct r
    LEFT JOIN tasks_dct t ON r.id = t.report_id
    WHERE r.report_date = ? AND r.shift = ?
  `;
  db.query(query, [date, shift], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json(results);
  });
});

// dct: Fetch all tasks for a specific report for it's date and shift
app.get("/dct/reports/:id/tasks", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM tasks_dct WHERE report_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});



// dct: Delete the Tasks for a specific shift for a specific report
app.delete("/dct/reports/:id/tasks", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM tasks_dct WHERE report_id = ?`;
  db.query(query, [id], (err) => {
    if (err) throw err;
    res.status(200).send("Tasks deleted successfully");
  });
});

app.post("/dct/reports", (req, res) => {
  const { reportDate, shift, tasks } = req.body;

  // Validate that reportDate, shift, and tasks are provided
  if (!reportDate || !shift || !tasks || tasks.length === 0) {
    return res.status(400).json({
      message: "Report date, shift, and tasks are required.",
    });
  }

  // Validate that each task contains the required fields
  for (let task of tasks) {
    if (!task.category || !task.actionTaken || !task.result) {
      return res.status(400).json({
        message: "Each task must include category, actionTaken, and result.",
      });
    }
  }

  // Insert the report
  const insertReport = `INSERT INTO reports_dct (report_date, shift) VALUES (?, ?)`;
  db.query(insertReport, [reportDate, shift], (err, result) => {
    if (err) {
      // Check for duplicate entry error (MySQL error code 1062)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "A report for this date and shift already exists.",
        });
      }
      return res.status(500).json({ message: "Server error", error: err });
    }

    const reportId = result.insertId;

    // Insert tasks
    const insertTask = `INSERT INTO tasks_dct (report_id, category, action_taken, result) VALUES ?`;
    const taskValues = tasks.map((task) => [
      reportId,
      task.category,
      task.actionTaken,
      task.result,
    ]);
    db.query(insertTask, [taskValues], (err) => {
      if (err) {
        console.error("Error inserting tasks: ", err);
        return res.status(500).json({ message: "Error adding tasks" });
      }
      res.status(201).send("Report added successfully");
    });
  });
});



// dct: to delete the whole day report
app.delete("/dct/reports/:report_date", (req, res) => {
  const { report_date } = req.params;
  const deleteReport = `DELETE FROM reports_dct WHERE report_date = ?`;
  db.query(deleteReport, [report_date], (err) => {
    if (err) throw err;
    res.status(200).send("All reports deleted successfully");
  });
});

// dct: to update a task
app.put("/dct/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { category, action_taken, result } = req.body;
  const updateTask = `UPDATE tasks_dct SET category = ?, action_taken = ?, result = ? WHERE id = ?`;
  db.query(updateTask, [category, action_taken, result, id], (err) => {
    if (err) throw err;
    res.status(200).send("Task updated successfully");
  });
});


// dct: Delete a task by ID
app.delete("/dct/tasks/:id", (req, res) => {
  const { id } = req.params;  // Get the task ID from the URL parameters
  const deleteTaskQuery = `DELETE FROM tasks_dct WHERE id = ?`;

  db.query(deleteTaskQuery, [id], (err) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: "Error deleting task" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  });
});

// dct: Insert tasks
app.post("/dct/tasks", (req, res) => {
  const { report_id, category, action_taken, result } = req.body; // Expecting task details and report_id

  // Check if all required fields are provided
  if (!report_id || !category || !action_taken || !result) {
    return res.status(400).json({ message: "Report ID, category, action_taken, and result are required" });
  }

  // Insert a single task
  const insertTask = `
      INSERT INTO tasks_dct (report_id, category, action_taken, result)
      VALUES (?, ?, ?, ?)
    `;

  db.query(insertTask, [report_id, category, action_taken, result], (err) => {
    if (err) {
      console.error("Error inserting task:", err);
      return res.status(500).json({ message: "Error inserting task", error: err });
    }
    res.status(201).send("Task added successfully");
  });
});

//------------------------------------ACT-------------------------------------//
// -----------------------------------ACT-------------------------------------//
// dct: Fetch all reports (grouped by date and shift, ordered by date desc)


app.get("/act/reports", (req, res) => {
  const query = `
    SELECT r.id, r.report_date, r.shift, t.category, t.action_taken, t.result
    FROM reports_act r
    LEFT JOIN tasks_act t ON r.id = t.report_id
    ORDER BY r.report_date DESC, FIELD(r.shift, 'Morning', 'Evening', 'Night')
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// dct to fetch data for a specific shift on a specific day
app.get("/act/reports/:date/:shift", (req, res) => {
  const { date, shift } = req.params;
  const query = `
    SELECT r.id AS report_id, r.report_date, r.shift, t.id AS task_id, t.category, t.action_taken, t.result
    FROM reports_act r
    LEFT JOIN tasks_act t ON r.id = t.report_id
    WHERE r.report_date = ? AND r.shift = ?
  `;
  db.query(query, [date, shift], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json(results);
  });
});

// dct: Fetch all tasks for a specific report for it's date and shift
app.get("/act/reports/:id/tasks", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM tasks_act WHERE report_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});



// dct: Delete the Tasks for a specific shift for a specific report
app.delete("/act/reports/:id/tasks", (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM tasks_act WHERE report_id = ?`;
  db.query(query, [id], (err) => {
    if (err) throw err;
    res.status(200).send("Tasks deleted successfully");
  });
});

app.post("/act/reports", (req, res) => {
  const { reportDate, shift, tasks } = req.body;

  // Validate that reportDate, shift, and tasks are provided
  if (!reportDate || !shift || !tasks || tasks.length === 0) {
    return res.status(400).json({
      message: "Report date, shift, and tasks are required.",
    });
  }

  // Validate that each task contains the required fields
  for (let task of tasks) {
    if (!task.category || !task.actionTaken || !task.result) {
      return res.status(400).json({
        message: "Each task must include category, actionTaken, and result.",
      });
    }
  }

  // Insert the report
  const insertReport = `INSERT INTO reports_act (report_date, shift) VALUES (?, ?)`;
  db.query(insertReport, [reportDate, shift], (err, result) => {
    if (err) {
      // Check for duplicate entry error (MySQL error code 1062)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "A report for this date and shift already exists.",
        });
      }
      return res.status(500).json({ message: "Server error", error: err });
    }

    const reportId = result.insertId;

    // Insert tasks
    const insertTask = `INSERT INTO tasks_act (report_id, category, action_taken, result) VALUES ?`;
    const taskValues = tasks.map((task) => [
      reportId,
      task.category,
      task.actionTaken,
      task.result,
    ]);
    db.query(insertTask, [taskValues], (err) => {
      if (err) {
        console.error("Error inserting tasks: ", err);
        return res.status(500).json({ message: "Error adding tasks" });
      }
      res.status(201).send("Report added successfully");
    });
  });
});



// dct: to delete the whole day report
app.delete("/act/reports/:report_date", (req, res) => {
  const { report_date } = req.params;
  const deleteReport = `DELETE FROM reports_act WHERE report_date = ?`;
  db.query(deleteReport, [report_date], (err) => {
    if (err) throw err;
    res.status(200).send("All reports deleted successfully");
  });
});

// dct: to update a task
app.put("/act/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { category, action_taken, result } = req.body;
  const updateTask = `UPDATE tasks_act SET category = ?, action_taken = ?, result = ? WHERE id = ?`;
  db.query(updateTask, [category, action_taken, result, id], (err) => {
    if (err) throw err;
    res.status(200).send("Task updated successfully");
  });
});


// dct: Delete a task by ID
app.delete("/act/tasks/:id", (req, res) => {
  const { id } = req.params;  // Get the task ID from the URL parameters
  const deleteTaskQuery = `DELETE FROM tasks_act WHERE id = ?`;

  db.query(deleteTaskQuery, [id], (err) => {
    if (err) {
      console.error("Error deleting task:", err);
      return res.status(500).json({ error: "Error deleting task" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  });
});

// dct: Insert tasks
app.post("/act/tasks", (req, res) => {
  const { report_id, category, action_taken, result } = req.body; // Expecting task details and report_id

  // Check if all required fields are provided
  if (!report_id || !category || !action_taken || !result) {
    return res.status(400).json({ message: "Report ID, category, action_taken, and result are required" });
  }

  // Insert a single task
  const insertTask = `
      INSERT INTO tasks_act (report_id, category, action_taken, result)
      VALUES (?, ?, ?, ?)
    `;

  db.query(insertTask, [report_id, category, action_taken, result], (err) => {
    if (err) {
      console.error("Error inserting task:", err);
      return res.status(500).json({ message: "Error inserting task", error: err });
    }
    res.status(201).send("Task added successfully");
  });
});

//------------------------------------ACT-------------------------------------//
// -----------------------------------ACT-------------------------------------//

//------------------------------------USERS-------------------------------------//
// -----------------------------------USERS-------------------------------------//

// **Login API**
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
	console.log( err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = results[0];

    // Compare the password using bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      // Send the user data including role
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        message: 'Authentication successful',
      });
    });
  });
});

// **Signup API**
app.post('/users/signup', (req, res) => {
  const { username, password, role } = req.body;

  // Validate role
  if (!['act', 'dct'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Hash the password using bcrypt
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    db.query(query, [username, hashedPassword, role], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating user' });
      }

      // Send the new user data (excluding password)
      return res.status(201).json({
        id: results.insertId,
        username: username,
        role: role,
        message: 'User created successfully',
      });
    });
  });
});

//------------------------------------USERS-------------------------------------//
// -----------------------------------USERS-------------------------------------//

// update start
app.get("/api/tasks/:category", (req, res) => {
  const { category } = req.params;

  // Fetch tasks from tasks_dct and join with reports_dct for report_date
  const queryDct = `
    SELECT 
      tasks_dct.*, 
      reports_dct.report_date, 
      'dct' as source
    FROM tasks_dct
    LEFT JOIN reports_dct ON tasks_dct.report_id = reports_dct.id
    WHERE tasks_dct.category = ?
  `;

  // Fetch tasks from tasks_act (no need for join as no report_date in tasks_act)
  const queryAct = `
    SELECT 
      tasks_act.*, 
      NULL as report_date, 
      'act' as source 
    FROM tasks_act
    WHERE tasks_act.category = ?
  `;

  // First fetch from tasks_dct
  db.query(queryDct, [category], (err, dctResults) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching tasks from tasks_dct' });
    }

    // Then fetch from tasks_act
    db.query(queryAct, [category], (err, actResults) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching tasks from tasks_act' });
      }

      // Combine both results
      const combinedResults = [...dctResults, ...actResults];
      
      // Return the combined results
      res.json(combinedResults);
    });
  });
});

// Daily Report End


const port = 8070;
const host = '172.17.40.200'; 
// Start server
app.listen(port,host, () => {
  console.log(`Server running on http://${host}:${port}`);
});

