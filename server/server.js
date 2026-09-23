const dns=require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); //force DNS to use Google and Cloudflare DNS servers

require("dotenv").config();

const express = require("express");  // importing express library
const connectDB = require("./config/db");
const app = express(); // creating express app
connectDB(); // connecting to database
const cors = require("cors");
app.use(cors());

const PORT = 5000; // choosing port number for server to run on

const taskRoutes = require("./routes/taskRoutes");
const planRoutes = require("./routes/planRoutes");
const focusRoutes = require("./routes/focusRoutes");
const authRoutes = require("./routes/authRoutes");

app.use(express.json()); // express needs to understand the json .so it acts as a translator
app.use("/api/tasks", taskRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res)=>{
    res.send("Smart Productivity Dashboard Backend is running")
});




app.post("/api/tasks", (req, res)=> {
    const newTask = req.body;
    tasks.push(newTask);
    res.status(201).json({message:"Task Added Succesfully",
        task: newTask
    });
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
