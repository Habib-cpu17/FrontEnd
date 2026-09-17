import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    const { pathname } = useLocation();
    return (
        <div className="min-h-screen bg-page text-body">
            <Navbar />
            <main key={pathname} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 hero-in">
                <Outlet />
            </main>
        </div>
    );
}