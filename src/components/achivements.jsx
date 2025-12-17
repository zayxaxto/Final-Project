// components/Achievements.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../css/ach.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState({});
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const { currentUser, getUserProgress, saveUserProgress } = useAuth();

  // กำหนดภารกิจทั้งหมด 8 ภารกิจ
  const achievementList = [
    {
      id: 'html_pioneer',
      title: 'HTML Pioneer',
      description: 'ผ่าน 3 ด่านแรกของ HTML',
      icon: '🏆',
      points: 500,
      requirement: {
        type: 'complete_levels',
        levels: [1, 2, 3],
        category: 'HTML'
      },
      color: '#3b82f6'
    },
    {
      id: 'css_master',
      title: 'CSS Master',
      description: 'ผ่านทุกด่านของ CSS',
      icon: '🎨',
      points: 750,
      requirement: {
        type: 'complete_levels',
        levels: [4, 5, 6],
        category: 'CSS'
      },
      color: '#22c55e'
    },
    {
      id: 'js_wizard',
      title: 'JavaScript Wizard',
      description: 'ผ่านทุกด่านของ JavaScript',
      icon: '⚡',
      points: 1000,
      requirement: {
        type: 'complete_levels',
        levels: [7, 8, 9],
        category: 'JavaScript'
      },
      color: '#f59e0b'
    },
    {
      id: 'bootstrap_champion',
      title: 'Bootstrap Champion',
      description: 'ผ่านทุกด่านของ Bootstrap',
      icon: '🚀',
      points: 800,
      requirement: {
        type: 'complete_levels',
        levels: [10, 11, 12],
        category: 'Bootstrap'
      },
      color: '#8b5cf6'
    },
    {
      id: 'web_developer',
      title: 'Web Developer',
      description: 'ผ่านครบทุกด่าน (12 ด่าน)',
      icon: '👨‍💻',
      points: 2000,
      requirement: {
        type: 'complete_all_levels',
        count: 12
      },
      color: '#10b981'
    },
    {
      id: 'score_collector',
      title: 'Score Collector',
      description: 'รวบรวมคะแนนได้ถึง 2000 แต้ม',
      icon: '💰',
      points: 600,
      requirement: {
        type: 'total_score',
        target: 2000
      },
      color: '#f97316'
    },
    {
      id: 'final_conqueror',
      title: 'Final Conqueror',
      description: 'ผ่านทุก Final Stage (ด่าน 3, 6, 9, 12)',
      icon: '🔥',
      points: 1500,
      requirement: {
        type: 'complete_finals',
        levels: [3, 6, 9, 12]
      },
      color: '#ec4899'
    }
  ];

  // โหลดข้อมูล achievements ของผู้ใช้
  useEffect(() => {
    const loadAchievements = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const progress = await getUserProgress();
        const userAchievementsData = progress.achievements || {};
        
        // ตรวจสอบความคืบหน้าของแต่ละภารกิจ
        const updatedAchievements = achievementList.map(achievement => {
          const userAchievement = userAchievementsData[achievement.id] || {
            unlocked: false,
            claimed: false,
            progress: 0
          };

          const progressData = calculateProgress(achievement, progress);
          
          return {
            ...achievement,
            ...userAchievement,
            progress: progressData.progress,
            maxProgress: progressData.maxProgress,
            unlocked: progressData.unlocked
          };
        });

        setAchievements(updatedAchievements);
        setUserAchievements(userAchievementsData);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [currentUser]);

  // คำนวณความคืบหน้าของภารกิจ
  const calculateProgress = (achievement, userProgress) => {
    const { requirement } = achievement;
    const completedLevels = userProgress.completedLevels || [];
    const totalScore = userProgress.totalScore || 0;
    const levelScores = userProgress.levelScores || {};

    switch (requirement.type) {
      case 'complete_levels':
        const completedRequiredLevels = requirement.levels.filter(level => 
          completedLevels.includes(level)
        );
        return {
          progress: completedRequiredLevels.length,
          maxProgress: requirement.levels.length,
          unlocked: completedRequiredLevels.length === requirement.levels.length
        };

      case 'perfect_scores':
        const perfectScores = Object.values(levelScores).filter(score => score === 300);
        return {
          progress: perfectScores.length,
          maxProgress: requirement.count,
          unlocked: perfectScores.length >= requirement.count
        };

      case 'complete_all_levels':
        return {
          progress: completedLevels.length,
          maxProgress: requirement.count,
          unlocked: completedLevels.length >= requirement.count
        };

      case 'total_score':
        return {
          progress: Math.min(totalScore, requirement.target),
          maxProgress: requirement.target,
          unlocked: totalScore >= requirement.target
        };

      case 'complete_finals':
        const completedFinals = requirement.levels.filter(level => 
          completedLevels.includes(level)
        );
        return {
          progress: completedFinals.length,
          maxProgress: requirement.levels.length,
          unlocked: completedFinals.length === requirement.levels.length
        };

      default:
        return { progress: 0, maxProgress: 1, unlocked: false };
    }
  };

  // รับรางวัล
  const claimAchievement = async (achievementId) => {
    if (!currentUser || claimingId) return;

    setClaimingId(achievementId);

    try {
      const progress = await getUserProgress();
      const currentAchievements = progress.achievements || {};
      const achievement = achievements.find(a => a.id === achievementId);

      if (!achievement || !achievement.unlocked || achievement.claimed) {
        setClaimingId(null);
        return;
      }

      // อัปเดตข้อมูลภารกิจ
      const updatedAchievements = {
        ...currentAchievements,
        [achievementId]: {
          unlocked: true,
          claimed: true,
          claimedAt: new Date().toISOString()
        }
      };

      // เพิ่มแต้มรางวัล
      const newTotalScore = progress.totalScore + achievement.points;

      // บันทึกลง Firebase
      await saveUserProgress(
        progress.completedLevels || [],
        newTotalScore,
        progress.levelScores || {},
        updatedAchievements
      );

      // อัปเดต state
      setAchievements(prev => prev.map(a => 
        a.id === achievementId ? { ...a, claimed: true } : a
      ));

      setUserAchievements(updatedAchievements);

      // ส่งอีเวนต์อัปเดตคะแนน
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { 
          score: newTotalScore,
          progress: progress.completedLevels || [],
          achievementClaimed: achievement.title,
          pointsEarned: achievement.points
        }
      }));

      // แสดงข้อความแจ้งเตือน
      alert(`🎉 ยินดีด้วย! คุณได้รับรางวัล "${achievement.title}"\n+${achievement.points} แต้ม\nคะแนนรวม: ${newTotalScore} แต้ม`);

    } catch (error) {
      console.error('Error claiming achievement:', error);
      alert('เกิดข้อผิดพลาดในการรับรางวัล');
    } finally {
      setClaimingId(null);
    }
  };

  // คำนวณสถิติรวม
  const stats = {
    total: achievements.length,
    completed: achievements.filter(a => a.unlocked).length,
    claimed: achievements.filter(a => a.claimed).length,
    totalPoints: achievements.reduce((sum, a) => sum + (a.claimed ? a.points : 0), 0)
  };

  if (loading) {
    return (
      <div className="achievements-loading-screen">
        <div className="loading-spinner"></div>
        <h2>กำลังโหลดภารกิจ...</h2>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      {/* Header Section */}
      <div className="achievements-header">
        <h1 className="achievements-title">🏆 Achievement</h1>
        <div className="achievements-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Unlock</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.claimed}</span>
            <span className="stat-label">Received</span>
          </div>
        </div>
      </div>

      {/* Achievements Grid - แถบยาว */}
      <div className="achievements-grid">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} ${achievement.claimed ? 'claimed' : ''}`}
            style={{ '--achievement-color': achievement.color }}
          >
            {/* Icon */}
            <div className="achievement-icon">
              {achievement.icon}
            </div>
            
            {/* Content */}
            <div className="achievement-content">
              <div className="achievement-header">
                <div className="achievement-info">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
                <div className="achievement-points">
                  +{achievement.points} Points
                </div>
              </div>
              
              <div className="achievement-progress">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                        background: `linear-gradient(135deg, ${achievement.color}, ${achievement.color}dd)`
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="achievement-action">
              {achievement.claimed ? (
                <div className="claimed-badge">
                  Received
                </div>
              ) : achievement.unlocked ? (
                <button 
                  className="claim-button"
                  onClick={() => claimAchievement(achievement.id)}
                  disabled={claimingId === achievement.id}
                >
                  {claimingId === achievement.id ? (
                    <div className="claim-loading">
                      <div className="spinner"></div>
                      กำลังรับ...
                    </div>
                  ) : (
                    <>
                      <span className="claim-icon"></span>
                      Get rewards
                    </>
                  )}
                </button>
              ) : (
                <div className="locked-badge">
                  🔒 lock
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="achievements-summary">
        <h2>Summary of progress</h2>
        <div className="summary-progress">
          <div className="summary-bar">
            <div 
              className="summary-fill"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            ></div>
          </div>
          <span className="summary-text">
            {stats.completed}/{stats.total} Mission ({Math.round((stats.completed / stats.total) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default Achievements;