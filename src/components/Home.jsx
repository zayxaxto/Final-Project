import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/level.css';
import raffyImg from '../img/Raffy.png';

const GameLevels = () => {
    const [completedLevels, setCompletedLevels] = useState([]);
    const [levelScores, setLevelScores] = useState({});
    const [totalScore, setTotalScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const { currentUser, getUserProgress } = useAuth();
    const navigate = useNavigate();

    const MIN_PASSING_SCORE = 80;

    useEffect(() => {
        const loadUserProgress = async () => {
            if (!currentUser) { navigate('/login'); return; }
            try {
                const progress = await getUserProgress();
                setCompletedLevels(progress.completedLevels || []);
                setLevelScores(progress.levelScores || {});
                setTotalScore(progress.totalScore || 0);
            } catch (error) { console.error('Error:', error); }
            finally { setLoading(false); }
        };

        loadUserProgress();

        const handleScoreUpdate = (event) => {
            if (event.detail) {
                if (event.detail.score !== undefined) setTotalScore(event.detail.score);
                if (event.detail.progress !== undefined) setCompletedLevels(event.detail.progress);
                if (event.detail.levelScores !== undefined) setLevelScores(event.detail.levelScores);
            }
        };

        window.addEventListener('scoreUpdated', handleScoreUpdate);
        return () => window.removeEventListener('scoreUpdated', handleScoreUpdate);
    }, [currentUser, getUserProgress, navigate]);

    const isLevelUnlocked = (levelNumber) => {
        if (levelNumber === 1) return true;
        const previousLevel = levelNumber - 1;
        const previousScore = levelScores[previousLevel] || 0;
        return completedLevels.includes(previousLevel) && previousScore >= MIN_PASSING_SCORE;
    };

    const isLevelCompleted = (levelNumber) => {
        const score = levelScores[levelNumber] || 0;
        return completedLevels.includes(levelNumber) && score >= MIN_PASSING_SCORE;
    };

    const getLevelStatus = (levelNumber) => {
        if (isLevelCompleted(levelNumber)) return 'completed';
        if (isLevelUnlocked(levelNumber)) {
            if ([3, 6, 9, 12].includes(levelNumber)) return 'final';
            return 'unlocked';
        }
        return 'locked';
    };

    const getLevelIcon = (levelNumber) => {
        const status = getLevelStatus(levelNumber);
        switch (status) {
            case 'completed': return '⭐';
            case 'final': return '🔥';
            case 'unlocked': return '⭐';
            default: return '🔒';
        }
    };

    // แสดงคะแนน Quiz ที่ทำได้ (0-100)
    const getScoreDisplay = (levelNumber) => {
        const score = levelScores[levelNumber];
        if (score !== undefined) return `${score}/100`;
        return '100 แต้ม';
    };

    const getScoreColor = (levelNumber) => {
        const score = levelScores[levelNumber] || 0;
        if (score >= MIN_PASSING_SCORE) return '#4caf50';
        if (score > 0) return '#f44336';
        return 'inherit';
    };

    const levels = [
        { number: 1, name: 'Stage 1', path: '/game/level1' },
        { number: 2, name: 'Stage 2', path: '/game/level2' },
        { number: 3, name: 'Final Stage', path: '/game/level3' },
        { number: 4, name: 'Stage 4', path: '/game/level4' },
        { number: 5, name: 'Stage 5', path: '/game/level5' },
        { number: 6, name: 'Final Stage', path: '/game/level6' },
        { number: 7, name: 'Stage 7', path: '/game/level7' },
        { number: 8, name: 'Stage 8', path: '/game/level8' },
        { number: 9, name: 'Final Stage', path: '/game/level9' },
        { number: 10, name: 'Stage 10', path: '/game/level10' },
        { number: 11, name: 'Stage 11', path: '/game/level11' },
        { number: 12, name: 'Final Stage', path: '/game/level12' }
    ];

    const levelGroups = [
        { title: 'Quiz 1 : HTML', levels: levels.slice(0, 3) },
        { title: 'Quiz 2 : CSS', levels: levels.slice(3, 6) },
        { title: 'Quiz 3 : JavaScript', levels: levels.slice(6, 9) },
        { title: 'Quiz 4 : Bootstrap', levels: levels.slice(9, 12) }
    ];

    if (loading) return <div className="game-container"><div style={{ textAlign: 'center', padding: '50px' }}><h2>กำลังโหลด...</h2></div></div>;

    return (
        <div className="game-container">
            <div className="content-wrapper">

                {/* Hero Section with Mascot */}
                <div className="hero-section">
                    <img src={raffyImg} alt="Raffy Mascot" className="raffy-mascot" />
                    <div className="hero-text">
                        <h2 className="welcome-text">Let's Learn & Play!</h2>
                        <p className="welcome-subtext">ตะลุยด่านเพื่อเก็บคะแนนไปกับ Raffy</p>
                    </div>
                </div>

                <div className="requirement-banner">
                    <div className="banner-icon">⚠️</div>
                    <p>ต้องได้คะแนน {MIN_PASSING_SCORE}/100 ขึ้นไป (80%) จึงจะผ่านด่าน</p>
                </div>

                {levelGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="level-group">
                        <div className="header"><h1 className="title">{group.title}</h1></div>
                        <div className="levels-grid">
                            {group.levels.map((level, index) => {
                                const status = getLevelStatus(level.number);
                                const unlocked = isLevelUnlocked(level.number);
                                const score = levelScores[level.number];
                                const passed = score >= MIN_PASSING_SCORE;
                                const hasScore = score !== undefined;

                                return (
                                    <React.Fragment key={level.number}>
                                        <div className={`level-item ${!unlocked ? 'locked' : ''}`}>
                                            {unlocked ? (
                                                <Link to={level.path} className={`level-button ${status}`}>
                                                    <div className="star-icon">{getLevelIcon(level.number)}</div>
                                                    <div className="level-number">Stage {level.number}</div>
                                                    <div className={`level-score ${passed ? 'pass' : (hasScore ? 'fail' : '')}`}>
                                                        {hasScore ? `${score}/100` : 'เริ่มเลย'}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className={`level-button ${status}`}>
                                                    <div className="lock-icon">🔒</div>
                                                    <div className="level-number">Stage {level.number}</div>
                                                    <div className="level-score locked">ล็อค</div>
                                                </div>
                                            )}
                                        </div>
                                        {index < group.levels.length - 1 && <div className="level-connection"></div>}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameLevels;
