import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import {
  AdminRoute,
  ProtectedRoute,
  PublicOnlyRoute,
} from '@/components/ProtectedRoute'
import AssignmentsPage from '@/pages/assignments/AssignmentsPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import InstrumentsPage from '@/pages/instruments/InstrumentsPage'
import NotFoundPage from '@/pages/misc/NotFoundPage'
import NewStudentPage from '@/pages/students/NewStudentPage'
import StudentDetailPage from '@/pages/students/StudentDetailPage'
import StudentsPage from '@/pages/students/StudentsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/estudiantes" element={<StudentsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/estudiantes/nuevo" element={<NewStudentPage />} />
          </Route>
          <Route path="/estudiantes/:id" element={<StudentDetailPage />} />
          <Route path="/instrumentos" element={<InstrumentsPage />} />
          <Route path="/asignaciones" element={<AssignmentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
