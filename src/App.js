import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./css/navbar.css";
import logo from "./img/bg.png";

// Import Authentication
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import existing components
import Home from "./components/Home"
import Beginner from "./components/begin";
import Intermediate from "./components/inter";
import Advanced from "./components/advan";
import Bootstrap from "./components/bootstrap";
import Preview from "./components/preview";
import Login from "./components/login";
import Register from "./components/register";
import Achivements from "./components/achivements";
import AdminDashboard from "./components/AdminDashboard";
import PostTest from "./components/post";

// Import game system
import GameLevels from "./components/Home";

// Define level components - 12 ด่าน
const Level1Component = React.lazy(() => import("./components/stage1"));
const Level2Component = React.lazy(() => import("./components/stage2"));
const Level3Component = React.lazy(() => import("./components/stage3"));
const Level4Component = React.lazy(() => import("./components/stage4"));
const Level5Component = React.lazy(() => import("./components/stage5"));
const Level6Component = React.lazy(() => import("./components/stage6"));
const Level7Component = React.lazy(() => import("./components/stage7"));
const Level8Component = React.lazy(() => import("./components/stage8"));
const Level9Component = React.lazy(() => import("./components/stage9"));
const Level10Component = React.lazy(() => import("./components/stage10"));
const Level11Component = React.lazy(() => import("./components/stage11"));
const Level12Component = React.lazy(() => import("./components/stage12"));

function Navbar() {
    const [totalScore, setTotalScore] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const { currentUser, logout, getUserProgress } = useAuth();

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        const loadUserScore = async () => {
            if (currentUser) {
                try {
                    const progress = await getUserProgress();
                    setTotalScore(progress.totalScore || 0);
                } catch (error) {
                    console.error('Error loading user score:', error);
                }
            }
        };

        loadUserScore();

        const handleScoreUpdate = (event) => {
            if (event.detail && event.detail.score !== undefined) {
                setTotalScore(event.detail.score);
            }
        };

        window.addEventListener('scoreUpdated', handleScoreUpdate);
        return () => window.removeEventListener('scoreUpdated', handleScoreUpdate);
    }, [currentUser, getUserProgress]);

    // เพิ่ม/ลบ class menu-open บน body เมื่อเปิด/ปิด menu
    useEffect(() => {
        if (menuOpen) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }

        return () => {
            document.body.classList.remove('menu-open');
        };
    }, [menuOpen]);

    // ปิด menu เมื่อคลิกนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.navbar')) {
                setMenuOpen(false);
                setDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuOpen]);

    // ปิด menu เมื่อเปลี่ยนหน้า
    const handleLinkClick = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    const handleLogout = () => {
        if (window.confirm('คุณต้องการออกจากระบบหรือไม่?')) {
            logout();
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        if (menuOpen) setDropdownOpen(false);
    };

    const toggleDropdown = (e) => {
        e.preventDefault();
        setDropdownOpen(!dropdownOpen);
    };

    const isAdmin = currentUser?.username === 'Phakapon';

    return (
        <nav className="navbar">
            {/* Logo - แสดงเสมอ */}
            <Link to="/" className="navbar-logo-link" onClick={handleLinkClick}>
                <img src={logo} alt="Logo" className="navbar-logo" />
            </Link>

            {/* Hamburger Button - แสดงเฉพาะหน้าจอเล็ก */}
            <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            </button>

            {/* Navigation Menu */}
            <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                <div className="navbar-left">
                    <Link to="/components/achivements" className="navbar-link" onClick={handleLinkClick}>
                        Achievement
                    </Link>

                    <div className="navbar-dropdown">
                        <span className="navbar-link" onClick={toggleDropdown}>
                            Online lesson ▾
                        </span>
                        <div className={`navbar-dropdown-content ${dropdownOpen ? 'show' : ''}`}>
                            <Link to="/components/begin" onClick={handleLinkClick}>Html</Link>
                            <Link to="/components/inter" onClick={handleLinkClick}>Css</Link>
                            <Link to="/components/advan" onClick={handleLinkClick}>Javascript</Link>
                            <Link to="/components/bootstrap" onClick={handleLinkClick}>Bootstrap</Link>
                        </div>
                    </div>

                    <Link to="/components/preview" className="navbar-link" onClick={handleLinkClick}>
                        Try it Yourself
                    </Link>
                    <Link to="/components/posttest" className="navbar-link" onClick={handleLinkClick}>
                        Post-test
                    </Link>

                    {isAdmin && (
                        <Link to="/admin" className="navbar-link admin-link" onClick={handleLinkClick}>
                            📊 Admin
                        </Link>
                    )}
                </div>

                <div className="navbar-right">
                    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Dark Mode" title="เปิด/ปิด โหมดมืด">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <div className="navbar-score">
                        <span className="score-icon">⭐</span>
                        <span className="score-text">{totalScore} แต้ม</span>
                    </div>

                    <div className="navbar-user">
                        <span className="user-welcome">
                            สวัสดี, {currentUser?.fullName}
                            {isAdmin && <span className="admin-indicator"> (Admin)</span>}
                        </span>
                        <button onClick={handleLogout} className="navbar-link logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay สำหรับ mobile */}
            {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)}></div>}
        </nav>
    );
}

// Simple Wrapper - แค่โหลด component ไม่ทำอะไรเพิ่ม (Stage จัดการคะแนนเอง)
const SimpleWrapper = ({ Component }) => {
    return (
        <React.Suspense fallback={<div className="loading-screen">กำลังโหลด...</div>}>
            <Component />
        </React.Suspense>
    );
};

// Main App Component
function AppContent() {
    const { currentUser } = useAuth();

    // เพิ่ม/ลบ class has-navbar บน body เมื่อ login/logout
    useEffect(() => {
        if (currentUser) {
            document.body.classList.add('has-navbar');
        } else {
            document.body.classList.remove('has-navbar');
        }

        return () => {
            document.body.classList.remove('has-navbar');
        };
    }, [currentUser]);

    return (
        <div className="App">
            {currentUser && <Navbar />}
            <Routes>
                <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/register" element={currentUser ? <Navigate to="/" replace /> : <Register />} />

                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/components/achivements" element={<ProtectedRoute><Achivements /></ProtectedRoute>} />
                <Route path="/components/begin" element={<ProtectedRoute><Beginner /></ProtectedRoute>} />
                <Route path="/components/inter" element={<ProtectedRoute><Intermediate /></ProtectedRoute>} />
                <Route path="/components/advan" element={<ProtectedRoute><Advanced /></ProtectedRoute>} />
                <Route path="/components/bootstrap" element={<ProtectedRoute><Bootstrap /></ProtectedRoute>} />
                <Route path="/components/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
                <Route path="/components/posttest" element={<ProtectedRoute><PostTest /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                {/* Game Routes */}
                <Route path="/game" element={<ProtectedRoute><GameLevels /></ProtectedRoute>} />

                {/* HTML Levels (1-3) - Stage จัดการคะแนนเอง */}
                <Route path="/game/level1" element={<ProtectedRoute><SimpleWrapper Component={Level1Component} /></ProtectedRoute>} />
                <Route path="/game/level2" element={<ProtectedRoute><SimpleWrapper Component={Level2Component} /></ProtectedRoute>} />
                <Route path="/game/level3" element={<ProtectedRoute><SimpleWrapper Component={Level3Component} /></ProtectedRoute>} />

                {/* CSS Levels (4-6) */}
                <Route path="/game/level4" element={<ProtectedRoute><SimpleWrapper Component={Level4Component} /></ProtectedRoute>} />
                <Route path="/game/level5" element={<ProtectedRoute><SimpleWrapper Component={Level5Component} /></ProtectedRoute>} />
                <Route path="/game/level6" element={<ProtectedRoute><SimpleWrapper Component={Level6Component} /></ProtectedRoute>} />

                {/* JavaScript Levels (7-9) */}
                <Route path="/game/level7" element={<ProtectedRoute><SimpleWrapper Component={Level7Component} /></ProtectedRoute>} />
                <Route path="/game/level8" element={<ProtectedRoute><SimpleWrapper Component={Level8Component} /></ProtectedRoute>} />
                <Route path="/game/level9" element={<ProtectedRoute><SimpleWrapper Component={Level9Component} /></ProtectedRoute>} />

                {/* Bootstrap Levels (10-12) */}
                <Route path="/game/level10" element={<ProtectedRoute><SimpleWrapper Component={Level10Component} /></ProtectedRoute>} />
                <Route path="/game/level11" element={<ProtectedRoute><SimpleWrapper Component={Level11Component} /></ProtectedRoute>} />
                <Route path="/game/level12" element={<ProtectedRoute><SimpleWrapper Component={Level12Component} /></ProtectedRoute>} />

                <Route path="*" element={currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

function App() {
    const routerBasename = window.location.pathname.startsWith("/coderaffy")
        ? "/coderaffy"
        : undefined;

    return (
        <AuthProvider>
            <Router basename={routerBasename}>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
