const express=require("express"); // imports express
const router=express.Router(); //  each feature gets own router i.e mini router

const{ getTasks, getTaskById, createTask, updateTask, deleteTask }= require("../controllers/taskController"); // imports get tasjs function from controller folder
const protect = require("../middleware/authMiddleware");
router.use(protect);
router.get("/",getTasks); // routes home path
router.get("/:id",getTaskById);
router.post("/",createTask);
router.put("/:id",updateTask);
router.delete("/:id", deleteTask);


module.exports=router; //exports router to server.js