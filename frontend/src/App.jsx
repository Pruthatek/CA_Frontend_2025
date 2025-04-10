import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Login from './components/Login/Login'
import MainPage from './components/MainPage/MainPage'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import Users from './components/Users/Users'
import Clients from './components/Clients/Clients'
import Departments from './components/Departments/Departments'
import Tasks from './components/Tasks/Tasks'
import CreateEmployeeForm from './components/Users/CreateEmployeeForm'
import Permission from './components/Users/Permission'
import CreateRole from './components/Users/CreateRole'
import WorkCategoryManagement from './components/Departments/WorkCategoryManagement'
import WorkApis from './components/Departments/workApis'
import ClientWorkAssignmentForm from './components/Clients/ClientWorkAssignmentForm'
import SubmitClientWork from './components/Tasks/SubmitClientWork'
import AttendanceManager from './components/Users/AttendanceManager'
import HolidayManager from './components/Users/HolidayManager'
import TasksReview from './components/Tasks/TasksReview'
import HR from './components/HR/HR'
import Billing from './components/HR/Billing'
import AddInward from './components/Tasks/AddInward'
import AddDsc from './components/Tasks/AddDsc'
import LocationManager from './components/Tasks/LocationManager'
import DSClist from './components/Utilities/DSClist'
import ImportDsc from './components/Imports/ImportDsc'
import CreateSchedule from './components/Tasks/CreateSchedule'
import CreateTask from './components/Tasks/CreateTask'
import ExpenseManager from './components/Expenses/ExpenseManager'
import TimeTrackingManager from './components/Users/TimeTrackingManager'
import SendReminder from './components/Utilities/SendReminder'
import Attendance from './components/Users/Attendance'
import Receipt from './components/HR/Receipt'
import CreditDebitNote from './components/HR/CreditDebitNote'
import Expense from './components/HR/Expense'
import VoucherRegister from './components/HR/VoucherRegister'
import DSCRegister from './components/HR/DSCRegister'
import MyVoucher from './components/HR/MyVoucher'
import LeaveRegister from './components/Utilities/LeaveRegister'
import ManageCompany from './components/ManageCompany/ManageCompany'
import ManageDepartment from './components/ManageCompany/ManageDepartment'
import DepartmentList from './components/ManageCompany/DepartmentList'
import CreateLocations from './components/ManageCompany/CreateLocations'
import CreateHolidays from './components/ManageCompany/CreateHolidays'
import SendBillDueReminder from './components/Utilities/SendBillDueReminder'
import BillingManagement from './components/Billing/BillingManagement'
import ReceiptManagement from './components/ReceiptManagement/ReceiptManagement'
import CreditNoteManager from './components/Billing/CreditNoteManager'
import DebitNoteManager from './components/Billing/DebitNoteManager'
import Reports from './components/Reports/Reports'
import StructeredBill from './components/HR/StructeredBill'
import ImportRequiredFiles from './components/Imports/ImportRequiredFiles'
import ImportActivityList from './components/Imports/ImportActivityList'
import ImportOutputFiles from './components/Imports/ImportOutputFiles'
import SubmitReview from './components/Tasks/SubmitReview'
import Groups from './components/Clients/Groups'
import Branches from './components/Clients/Branches'
import InwardOutward from './components/Utilities/InwardOutward'
import ClientInquiryForm from './components/Clients/ClientInquiryForm'
import ClientInquiries from './components/Clients/ClientInquiries'
import ManageBanks from './components/ManageCompany/ManageBanks'
// import InvoiceTemplate from './components/Invoice/InvoiceTemplate'
// import StatusTemplate from './components/Invoice/StatusTemplate'
import SendActivityReportForm from './components/Tasks/SendActivityReportForm'
import RequestAttendance from './components/HR/RequestAttendance'
import AttendanceRegister from './components/HR/AttendanceRegister'
import CreateTeam from './components/ManageCompany/CreateTeam'
import ClientInquiryForm2 from './components/Clients/ClientInquiryForm2'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AssignUserLeaves from './components/HR/AssignUserLeaves'
import UserLeaveRegister from './components/HR/UserLeaveRegister'

function App() {


  return (
    <>
     <BrowserRouter>
      <Routes>
      <Route index element={<Login />} />
      <Route path="/main" element={
        <ProtectedRoute>
        <Layout />
        </ProtectedRoute>}>
      <Route index element={<Navigate to="/main/dashboard" />} />
                    <Route path="/main/dashboard" element={<Dashboard />} />
                    {/* <Route path="/main/invoicetemp" element={<InvoiceTemplate />} /> */}
                    <Route path="/main/users" element={<Users/>} />
                    <Route path="/main/departments" element={<Departments/>} />
                    <Route path="/main/reports" element={<Reports/>} />

                    <Route path="/main/tasks" >
                    <Route path="tasks" element={<Tasks />} />
                    <Route path="create-task" element={<CreateTask />} />
                    <Route path="create-schedule" element={<CreateSchedule />} />
                    </Route>

                    <Route path="/main/clients" >
                    <Route path="clients" element={<Clients />} />
                    <Route path="inquiry-form" element={<ClientInquiryForm2 />} />
                    <Route path="clientinquiries" element={<ClientInquiries />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="branches" element={<Branches />} />
                    </Route>

                    <Route path="/main/schedule" element={<CreateSchedule />} />
                    <Route path="/main/team" element={<CreateTeam />} />
                    <Route path="/main/tasks-review" element={<TasksReview/>} />
                    <Route path="/main/createuser" element={<CreateEmployeeForm/>} />
                    <Route path="/main/roles" element={<CreateRole/>} />
                    <Route path="/main/permissions" element={<Permission/>} />
                    <Route path="/main/workcategory" element={<WorkCategoryManagement/>} />
                    <Route path="/main/workassign" element={<ClientWorkAssignmentForm/>} />
                    <Route path="/main/submitclientwork" element={<SubmitClientWork/>} />
                    <Route path="/main/employees" element={<AttendanceManager/>} />
                    <Route path="/main/managecompany" element={<ManageCompany/>} />
                    <Route path="/main/managebanks" element={<ManageBanks/>} />
                    <Route path="/main/managedepartment" element={<ManageDepartment/>} />
                    <Route path="/main/departmentlist" element={<DepartmentList/>} />
                    <Route path="/main/billing" element={<BillingManagement/>} />
                    <Route path="/main/receipt" element={<ReceiptManagement/>} />
                    <Route path="/main/creditnote" element={<CreditNoteManager/>} />
                    <Route path="/main/debitnote" element={<DebitNoteManager/>} />
                    <Route path="/main/submitreview" element={<SubmitReview/>} />
                    <Route path="/main/inquiries" element={<ClientInquiries/>} />
                    <Route path="/main/sendreport" element={<SendActivityReportForm/>} />
                    

                    <Route path="/main/hr">
                      <Route path="attendance" element={<Attendance/>} />
                      <Route path="request-attendance" element={<RequestAttendance/>} />
                      <Route path="attendance-register" element={<AttendanceRegister/>} />
                      <Route path="create-bill" element={<HR/>} />
                      <Route path="users-leaves" element={<AssignUserLeaves/>} />
                      <Route path="structured" element={<StructeredBill/>} />
                      <Route path="user-leave-register" element={<UserLeaveRegister/>} />
                      <Route path="billing" element={<Billing/>} />
                      <Route path="receipt" element={<Receipt/>} />
                      <Route path="time-tracker" element={<TimeTrackingManager/>} />
                      <Route path="holiday-manager" element={<CreateHolidays />} />
                      <Route path="credit-debit-notes" element={<CreditDebitNote/>} />
                      <Route path="expense" element={<Expense/>} />
                      <Route path="voucher-register" element={<VoucherRegister/>} />
                      <Route path="dsc-register" element={<DSCRegister />} />
                      <Route path="my-voucher" element={<MyVoucher />} />
                    </Route>

                    <Route path="/main/add-dsc" element={<AddDsc />} />
                    <Route path="/main/inward" element={<AddInward />} />
                    <Route path="/main/location" element={<LocationManager />} />
                    <Route path="/main/expense" element={<ExpenseManager />} />
                    <Route path="/main/time" element={<TimeTrackingManager />} />
                    

                    <Route path="/main/utilities" >
                      <Route path="dsc-register" element={<DSClist />} />
                      <Route path="manage-company" element={<ManageCompany />} />
                      <Route path="manage-teams" element={<CreateTeam />} />
                      <Route path="manage-banks" element={<ManageBanks />} />
                      <Route path="send-reminder" element={<SendReminder />} />
                      <Route path="leave-register" element={<LeaveRegister />} />
                      <Route path="send-bill-due-reminder" element={<SendBillDueReminder />} />
                      <Route path="createlocation" element={<CreateLocations/>} />
                      <Route path="inward-outward" element={<InwardOutward/>} />
                    </Route>

                    <Route path="/main/imports">
                    <Route path="dsc" element={<ImportDsc />} />
                    <Route path="required-files" element={<ImportRequiredFiles />} />
                    <Route path="activity-list" element={<ImportActivityList />} />
                    <Route path="output-files" element={<ImportOutputFiles />} />
                    </Route>

                </Route>
      </Routes>  
     
     </BrowserRouter>

    </>
  )
}

export default App
