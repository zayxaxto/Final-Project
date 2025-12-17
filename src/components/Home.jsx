import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/level.css';

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
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px 30px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '1.2em', fontWeight: '600' }}>⚠️ ต้องได้คะแนน {MIN_PASSING_SCORE}/100 ขึ้นไป (80%) จึงจะผ่านด่านและปลดล็อกด่านถัดไป</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '0.95em', opacity: 0.9 }}></p>
                </div>

                {levelGroups.map((group, groupIndex) => (
                    <div key={groupIndex} style={{ marginBottom: '60px' }}>
                        <div className="header" style={{ marginBottom: '30px' }}><h1 className="title">{group.title}</h1></div>
                        <div className="levels-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                            {group.levels.map((level, index) => {
                                const status = getLevelStatus(level.number);
                                const unlocked = isLevelUnlocked(level.number);
                                const completed = isLevelCompleted(level.number);
                                const hasAttempted = levelScores[level.number] !== undefined;
                                const levelScore = levelScores[level.number] || 0;

                                return (
                                    <React.Fragment key={level.number}>
                                        <div className={`level-item ${!unlocked ? 'locked' : ''}`}>
                                            <div className="level-label">{level.name}</div>
                                            {unlocked ? (
                                                <Link to={level.path} className={`level-button ${status}`}>
                                                    <div className="star-icon">{getLevelIcon(level.number)}</div>
                                                    <div className="level-number">Stage {level.number}</div>
                                                    <div className="level-points" style={{ color: getScoreColor(level.number) }}>{getScoreDisplay(level.number)}</div>
                                                    {completed && <div style={{ position: 'absolute', top: '5px', right: '5px', background: '#4caf50', color: 'white', fontSize: '0.7em', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}></div>}
                                                    {hasAttempted && !completed && <div style={{ position: 'absolute', top: '5px', right: '5px', background: '#f44336', color: 'white', fontSize: '0.65em', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>ไม่ผ่าน ({levelScore}%)</div>}
                                                </Link>
                                            ) : (
                                                <div className={`level-button ${status}`}>
                                                    <div className="lock-icon">{getLevelIcon(level.number)}</div>
                                                    <div className="level-number">Stage {level.number}</div>
                                                    <div className="level-points">🔒 ล็อค</div>
                                                    <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65em', color: '#999', whiteSpace: 'nowrap' }}></div>
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
