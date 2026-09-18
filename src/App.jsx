import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ComponentsPage from "./pages/ComponentsPage";
import BuilderPage from "./pages/BuilderPage";
import BuildDetailPage from "./pages/BuildDetailPage";
import MyBuildsPage from "./pages/MyBuildsPage";
import PublicBuildsPage from "./pages/PublicBuildsPage";
import AdminPage from "./pages/AdminPage";
import ProfilePage from "./pages/ProfilePage";
import ChatWidget from "./components/chat/ChatWidget";


export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Landing — standalone, has its own nav */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth pages — standalone */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* App pages — inside Layout with Navbar */}
                    <Route element={<Layout />}>
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/components" element={<ComponentsPage />} />
                        <Route
                            path="/builder"
                            element={
                                <ProtectedRoute>
                                    <BuilderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/builder/:id"
                            element={
                                <ProtectedRoute>
                                    <BuilderPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/builds/:id" element={<BuildDetailPage />} />
                        <Route
                            path="/my-builds"
                            element={
                                <ProtectedRoute>
                                    <MyBuildsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/public-builds" element={<PublicBuildsPage />} />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminPage />
                                </AdminRoute>
                            }
                        />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/users/:id" element={<ProfilePage />} />

                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <ChatWidget />
            </BrowserRouter>
        </AuthProvider>
    );
}