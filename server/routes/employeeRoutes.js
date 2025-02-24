const express = require("express");
const router = express.Router();
const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    recordAttendance,
    applyLeave,
    updateLeaveStatus,
    recordOvertime,
    updateOvertimeStatus,
    getMonthlySalary
} = require("../controllers/employeeController");

// Basic CRUD routes
router.post("/", addEmployee);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

// Attendance routes
router.post("/attendance", recordAttendance);

// Leave management routes
router.post("/leave", applyLeave);
router.put("/leave/status", updateLeaveStatus);

// Overtime routes
router.post("/overtime", recordOvertime);
router.put("/overtime/status", updateOvertimeStatus);

// Salary routes
router.get("/salary/:employeeId/:year/:month", getMonthlySalary);

module.exports = router;