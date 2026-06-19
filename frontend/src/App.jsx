import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import Employees from "./pages/admin/Employees";
import Attendance from "./pages/admin/Attendance";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeeProfile from "./pages/employee/MyProfile";
import Schedules from "./pages/admin/Schedules";
import Overtime from "./pages/admin/Overtime";
import Salaries from "./pages/admin/Salaries";
import Contracts from "./pages/admin/Contracts";
import Bonuses from "./pages/admin/Bonus";
import EmployeeChangePassword from "./pages/employee/EmployeeChangePassword";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import BonusAssignments from "./pages/admin/BonusAssignments";
import Department from "./pages/admin/Department";

import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="overtime" element={<Overtime />} />
          <Route path="salaries" element={<Salaries />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="bonuses" element={<Bonuses />} />
          <Route path="bonus-assignments" element={<BonusAssignments />} />
          <Route path="departments" element={<Department />} />
          <Route path="change-password" element={<AdminChangePassword />} />
        </Route>

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="change-password" element={<EmployeeChangePassword />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="profile" element={<EmployeeProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
