require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

const User = require("./models/user.model");
const Note = require("./models/notes.model");
const connectionString = process.env.MONGO_URL;

mongoose.connect(connectionString);

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
app.use(express.json());

app.use(
    cors({
        origin:"*"

    })
);

app.get("/",(req, res) => {
    res.json({ data:"hello"});
});

//Create account
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;
    
    if(!email) {
        return res
        .status(400)
        .json({ error:true, message:"Email is required" });
    }

    if(!password) {
        return res
        .status(400)
        .json({ error:true, message:"Password is required" });
    }

    const isUser = await User.findOne({ email:email });
    if(isUser) {
        return res.json({
            error:true,
            message:"User already exists",
        });
    }
    const user = new User({
        fullName,
        email,
        password,
    });
    await user.save();
    const accessToken = jwt.sign({ user},
        process.env.ACCESS_TOKEN_SECRET, {
            expiresIn:"36000m",
        });
    return res.json({
        error: false,
        user,
        accessToken,
        message:"Registration Successful",
    });
});

//Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: true, message: "Email is required" });
    }
  
    if (!password) {
      return res.status(400).json({ error: true, message: "Password is required" });
    }
  
    const userInfo = await User.findOne({ email: email });
    if (!userInfo) {
      return res.json({ error: true, message: "User Not Found" });
    }
  
    if (userInfo.email === email && userInfo.password === password) {
      const user = { user: userInfo };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m",
      });
  
      return res.json({
        error: false,  // Fix: Set error to false for success
        message: "Login Successful",  // Correct message
        email,
        accessToken,
      });
    } else {
      return res.status(400).json({ error: true, message: "Invalid Credentials" });
    }
  });
  


//Add Notes
app.post("/add-note", authenticateToken, async (req,res) => {
const { title, priority, status, startTime,endTime } = req.body;
const { user } = req.user;
if(!title){
    return res
        .status(400)
        .json({ error:true, message:"Title is required" });
}

try {
    const note = new Note({
        title,
        priority,
        status,
        startTime,
        endTime,
        userId: user._id,
    });
await note.save();
return res.json({
    error:false,
    note,
    message:"Task added Successfully",
});
}
catch (error) {
    return res.status(500).json({
        error:true,
        message:"Internal Server Error"
    });
}
});

//Edit Notes
app.put("/edit-note/:noteId", authenticateToken, async (req,res) => {
    const noteId = req.params.noteId;
    const { title, priority, status, startTime,endTime } = req.body;
    const { user }= req.user;

    if(!title) {
        return res
        .status(400)
        .json({ error: true, message:"No Changes provided" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if(!note) {
            return res
            .status(400)
            .json({ error: true, message:"Note not found" });
        
        }
        if(title) note.title = title;
        if(priority) note.priority = priority;
        if(status) note.status = status;
        if(startTime) note.startTime = startTime;
        if(endTime) note.endTime = endTime;


        await note.save();
        return res.json({
            error:false,
            note,
            message:"Task updated Succesfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error",
        });

    }

});

//Get All Notes
app.get("/get-all-notes/", authenticateToken, async (req,res) => {

    const { user } = req.user;

    try {
        const notes = await Note.find({ userId: user._id })
        .sort({ isPinned: -1 });
        return res.json({
            error: false,
            notes,
            message: "All Task retrived Successfully",
        });
    }
    catch(error) {
        return res.status(500).json({
            error:true,
            message:"Internal Server Error",
        });
    }
});


//Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;
  
    try {
      const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId: user._id });
  
      if (!deletedNote) {
        return res
          .status(404)
          .json({ error: true, message: "Note not found" });
      }
  
      return res.json({
        error: false,
        message: "Task Deleted Successfully",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal Server Error",
      });
    }
  });


// Dashboard Statistics
app.get("/stats", authenticateToken, async (req, res) => {
    const { user } = req.user;

    try {
        // Fetch tasks (notes)
        const tasks = await Note.find({ userId: user._id });

        // Calculate statistics
        const totalCount = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === "Finished");
        const pendingTasks = tasks.filter((task) => task.status === "Pending");

        const completedCount = completedTasks.length;
        const pendingCount = pendingTasks.length;

        // Task completion percentages
        const percentCompleted = totalCount ? (completedCount / totalCount) * 100 : 0;
        const percentPending = totalCount ? (pendingCount / totalCount) * 100 : 0;

        // Calculate time-related statistics for pending tasks
        const pendingGroupedByPriority = pendingTasks.reduce((acc, task) => {
            const lapsedTime = Math.max(0, (new Date() - new Date(task.startTime)) / (1000 * 60 * 60)); // Lapsed time in hours
            const balanceTime = Math.max(0, (new Date(task.endTime) - new Date()) / (1000 * 60 * 60)); // Balance time in hours
        
            // Initialize the priority group if it doesn't exist
            if (!acc[task.priority]) {
                acc[task.priority] = { PendingTask: 0, lapsedTime: 0, balanceTime: 0 };
            }
        
            // Increment PendingTask count for the priority
            acc[task.priority].PendingTask += 1;
        
            // Accumulate lapsed and balance time
            acc[task.priority].lapsedTime += lapsedTime;
            acc[task.priority].balanceTime += balanceTime;
        
            return acc;
        }, {});
        

        // Average completion time for completed tasks
        const averageCompletionTime = completedTasks.reduce((sum, task) => {
            const totalTime = (new Date(task.endTime) - new Date(task.startTime)) / (1000 * 60 * 60); // Total time in hours
            return sum + totalTime;
        }, 0) / (completedTasks.length || 1);

        // User-specific statistics
        const userStats = {
            totalTasks: totalCount,
            completedTasks: completedCount,
            pendingTasks: pendingCount,
            percentCompleted,
            percentPending,
            averageCompletionTime,
            pendingGroupedByPriority,
        };

        // Response with statistics
        return res.json({
            error: false,
            userStats,
            message: "Task statistics retrieved successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
});

app.listen(8000);

module.exports = app;