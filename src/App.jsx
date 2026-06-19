import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { PrivateRoute, AdminRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageGames from "./pages/admin/ManageGames";
import Bet from "./pages/Bet";
import History from "./pages/History";
import Results from "./pages/admin/Results";
import Ranking from "./pages/Ranking";
import RankingAdmin from "./pages/admin/RankingAdmin";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />
          {/* Admin */}
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route
  path="/"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
    
  }
/>
<Route
  path="/history"
  element={
    <PrivateRoute>
      <History />
    </PrivateRoute>
  }
/>
<Route
  path="/admin/games"
  element={
    <AdminRoute>
      <ManageGames />
    </AdminRoute>
  }
/>
<Route
  path="/admin/results"
  element={
    <AdminRoute>
      <Results />
    </AdminRoute>
  }
/>
<Route
  path="/ranking"
  element={
    <PrivateRoute>
      <Ranking />
    </PrivateRoute>
  }
/>
<Route
  path="/bet"
  element={
    <PrivateRoute>
      <Bet />
    </PrivateRoute>
  }
/>
<Route path="/admin/ranking" element={<RankingAdmin />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
