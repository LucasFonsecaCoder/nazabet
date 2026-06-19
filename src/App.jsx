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
import React from "react";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          
          <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
          <Route path="/admin/games" element={<AdminRoute><ManageGames /></AdminRoute>} />
          <Route path="/admin/results" element={<AdminRoute><Results /></AdminRoute>} />
          <Route path="/admin/ranking" element={<RankingAdmin />} />
          
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
          <Route path="/bet" element={<PrivateRoute><Bet /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}