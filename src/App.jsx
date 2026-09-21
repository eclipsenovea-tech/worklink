import { Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Auth from './pages/Auth.jsx'
import AppShell from './components/AppShell.jsx'
import Home from './pages/Home.jsx'
import FindWork from './pages/FindWork.jsx'
import TaskDetail from './pages/TaskDetail.jsx'
import PostTask from './pages/PostTask.jsx'
import Profile from './pages/Profile.jsx'
import Wallet from './pages/Wallet.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="find-work" element={<FindWork />} />
        <Route path="task/:id" element={<TaskDetail />} />
        <Route path="post-task" element={<PostTask />} />
        <Route path="profile" element={<Profile />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
