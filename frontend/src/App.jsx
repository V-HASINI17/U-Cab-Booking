import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';

// User Portal Pages
import Home from './pages/User/Home';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import Uhome from './pages/User/Uhome';
import BookCab from './pages/User/BookCab';
import MyBooking from './pages/User/MyBooking';
import Support from './pages/User/Support';

// Admin Portal Pages
import Alogin from './pages/Admin/Alogin';
import Aregister from './pages/Admin/Aregister';
import Ahome from './pages/Admin/Ahome';
import Users from './pages/Admin/Users';
import UserEdit from './pages/Admin/UserEdit';
import Acabs from './pages/Admin/Acabs';
import AddCar from './pages/Admin/AddCar';
import AcabEdit from './pages/Admin/AcabEdit';
import Booking from './pages/Admin/Booking';
import SupportTickets from './pages/Admin/SupportTickets';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#FFF8E1' }}>
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect based on path context
    const isAdminPath = window.location.pathname.startsWith('/admin');
    return <Navigate to={isAdminPath ? '/admin/login' : '/login'} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized, bounce back
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'driver') return <Navigate to="/my-bookings" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Portal Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Passenger Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Uhome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-cab"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <BookCab />
              </ProtectedRoute>
            }
          />

          {/* Passenger & Driver Shared Protected Routes */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['user', 'driver']}>
                <MyBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute allowedRoles={['user', 'driver']}>
                <Support />
              </ProtectedRoute>
            }
          />

          {/* Admin Public Routes */}
          <Route path="/admin/login" element={<Alogin />} />
          <Route path="/admin/register" element={<Aregister />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Ahome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cabs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Acabs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cabs/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cabs/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AcabEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support-tickets"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SupportTickets />
              </ProtectedRoute>
            }
          />

          {/* Fallback Bouncer */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
