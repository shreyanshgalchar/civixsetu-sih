import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import { AppShell } from "./components/AppShell";

import CitizenOverview from "./pages/citizen/Overview";
import NewReport from "./pages/citizen/NewReport";
import MyReports from "./pages/citizen/MyReports";
import Track from "./pages/citizen/Track";
import Leaderboard from "./pages/citizen/Leaderboard";
import Analytics from "./pages/Analytics";

import OfficerDashboard from "./pages/officer/Dashboard";
import Queue from "./pages/officer/Queue";
import Team from "./pages/officer/Team";

function wrap(el: React.ReactNode, role: "citizen" | "officer") {
  return <AppShell role={role}>{el}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route path="/citizen" element={wrap(<CitizenOverview />, "citizen")} />
        <Route path="/citizen/report" element={wrap(<NewReport />, "citizen")} />
        <Route path="/citizen/reports" element={wrap(<MyReports />, "citizen")} />
        <Route path="/citizen/track/:id" element={wrap(<Track />, "citizen")} />
        <Route path="/citizen/leaderboard" element={wrap(<Leaderboard />, "citizen")} />
        <Route path="/citizen/analytics" element={wrap(<Analytics />, "citizen")} />

        <Route path="/officer" element={wrap(<OfficerDashboard />, "officer")} />
        <Route path="/officer/queue" element={wrap(<Queue />, "officer")} />
        <Route path="/officer/analytics" element={wrap(<Analytics officer />, "officer")} />
        <Route path="/officer/team" element={wrap(<Team />, "officer")} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
