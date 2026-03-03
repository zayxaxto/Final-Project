// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import { ref, get, remove } from 'firebase/database';
import '../css/admin.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // รายการ achievements ทั้งหมด
  const achievementList = [
    { id: 'html_pioneer', title: 'HTML Pioneer', description: 'ผ่าน 3 ด่านแรกของ HTML', icon: '🏆', points: 500, color: '#3b82f6' },
    { id: 'css_master', title: 'CSS Master', description: 'ผ่านทุกด่านของ CSS', icon: '🎨', points: 750, color: '#22c55e' },
    { id: 'js_wizard', title: 'JavaScript Wizard', description: 'ผ่านทุกด่านของ JavaScript', icon: '⚡', points: 1000, color: '#f59e0b' },
    { id: 'bootstrap_champion', title: 'Bootstrap Champion', description: 'ผ่านทุกด่านของ Bootstrap', icon: '🚀', points: 800, color: '#8b5cf6' },
    { id: 'web_developer', title: 'Web Developer', description: 'ผ่านครบทุกด่าน (12 ด่าน)', icon: '👨‍💻', points: 2000, color: '#10b981' },
    { id: 'score_collector', title: 'Score Collector', description: 'รวบรวมคะแนนได้ถึง 2000 แต้ม', icon: '💰', points: 600, color: '#f97316' },
    { id: 'final_conqueror', title: 'Final Conqueror', description: 'ผ่านทุก Final Stage', icon: '🔥', points: 1500, color: '#ec4899' }
  ];

  // รายการวิดีโอทั้งหมด (เพิ่มตามที่มีในระบบ)
  const videoList = [
    { id: 'html_video_1', title: 'Episode 1 : HTML', totalQuizzes: 2, pointsPerQuiz: 75 },
    { id: 'inter_video_1', title: 'Episode 2 : CSS', totalQuizzes: 2, pointsPerQuiz: 75 },
    { id: 'advan_video_1', title: 'Episode 3 : Javascript', totalQuizzes: 2, pointsPerQuiz: 75 },
    { id: 'bootstrap_video_1', title: 'Episode 4 : Bootstrap', totalQuizzes: 2, pointsPerQuiz: 75 }
  ];

  // รายการด่านทั้งหมด
  const levelList = [
    { number: 1, name: 'Stage 1', category: 'HTML', categoryColor: '#3b82f6' },
    { number: 2, name: 'Stage 2', category: 'HTML', categoryColor: '#3b82f6' },
    { number: 3, name: 'Final Stage', category: 'HTML', categoryColor: '#3b82f6', isFinal: true },
    { number: 4, name: 'Stage 4', category: 'CSS', categoryColor: '#22c55e' },
    { number: 5, name: 'Stage 5', category: 'CSS', categoryColor: '#22c55e' },
    { number: 6, name: 'Final Stage', category: 'CSS', categoryColor: '#22c55e', isFinal: true },
    { number: 7, name: 'Stage 7', category: 'JavaScript', categoryColor: '#f59e0b' },
    { number: 8, name: 'Stage 8', category: 'JavaScript', categoryColor: '#f59e0b' },
    { number: 9, name: 'Final Stage', category: 'JavaScript', categoryColor: '#f59e0b', isFinal: true },
    { number: 10, name: 'Stage 10', category: 'Bootstrap', categoryColor: '#8b5cf6' },
    { number: 11, name: 'Stage 11', category: 'Bootstrap', categoryColor: '#8b5cf6' },
    { number: 12, name: 'Final Stage', category: 'Bootstrap', categoryColor: '#8b5cf6', isFinal: true }
  ];

  // ตรวจสอบสิทธิ์ Admin
  useEffect(() => {
    if (!currentUser || currentUser.username !== 'Phakapon') {
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      navigate('/');
    }
  }, [currentUser, navigate]);

  // โหลดข้อมูลผู้ใช้ทั้งหมดจาก Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const usersMap = new Map();

          for (const [key, userData] of Object.entries(usersData)) {
            if (userData.username && userData.fullName) {
              const username = userData.username;

              usersMap.set(username, {
                id: key,
                username: userData.username,
                fullName: userData.fullName,
                createdAt: userData.createdAt,
                gameProgress: userData.gameProgress || {
                  completedLevels: [],
                  totalScore: 0,
                  levelScores: {},
                  achievements: {},
                  videoQuizProgress: {}
                },
                postTestScore: userData.postTestScore || null
              });
            }
          }

          for (const username of usersMap.keys()) {
            try {
              const separateRef = ref(database, `${username}/postTestScore`);
              const separateSnapshot = await get(separateRef);

              if (separateSnapshot.exists()) {
                const separatePostTest = separateSnapshot.val();
                const user = usersMap.get(username);

                if (!user.postTestScore) {
                  user.postTestScore = separatePostTest;
                } else {
                  const userDate = new Date(user.postTestScore.completedAt || 0);
                  const separateDate = new Date(separatePostTest.completedAt || 0);

                  if (separateDate > userDate) {
                    user.postTestScore = separatePostTest;
                  }
                }
              }
            } catch (error) {
              console.log(`No separate post-test data for ${username}`);
            }
          }

          const usersList = Array.from(usersMap.values());
          console.log('Loaded users:', usersList);
          setUsers(usersList);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.username === 'Phakapon') {
      loadUsers();
    }
  }, [currentUser]);

  // คำนวณสถิติรวม
  const getStatistics = () => {
    const totalUsers = users.length;
    const totalScore = users.reduce((sum, user) => sum + (user.gameProgress?.totalScore || 0), 0);
    const averageScore = totalUsers > 0 ? Math.round(totalScore / totalUsers) : 0;
    const completedAllLevels = users.filter(user =>
      user.gameProgress?.completedLevels?.length >= 12
    ).length;
    const completedPostTest = users.filter(user => user.postTestScore !== null).length;
    const passedPostTest = users.filter(user => user.postTestScore?.passed === true).length;

    return { totalUsers, totalScore, averageScore, completedAllLevels, completedPostTest, passedPostTest };
  };

  // ฟิลเตอร์และจัดเรียงผู้ใช้
  const getFilteredAndSortedUsers = () => {
    let filteredUsers = [...users];

    if (searchTerm) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLevel !== 'all') {
      const levelNum = parseInt(filterLevel);
      filteredUsers = filteredUsers.filter(user =>
        user.gameProgress?.completedLevels?.includes(levelNum)
      );
    }

    filteredUsers.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.gameProgress?.totalScore || 0) - (a.gameProgress?.totalScore || 0);
        case 'progress':
          return (b.gameProgress?.completedLevels?.length || 0) -
            (a.gameProgress?.completedLevels?.length || 0);
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'posttest':
          const aHasScore = a.postTestScore !== null;
          const bHasScore = b.postTestScore !== null;
          if (aHasScore && !bHasScore) return -1;
          if (!aHasScore && bHasScore) return 1;
          return (b.postTestScore?.percentage || 0) - (a.postTestScore?.percentage || 0);
        default:
          return 0;
      }
    });

    return filteredUsers;
  };

  // แสดงระดับความคืบหน้า
  const getProgressLevel = (completedLevels) => {
    const count = completedLevels?.length || 0;
    if (count === 0) return { text: 'เริ่มต้น', color: '#6b7280' };
    if (count <= 3) return { text: 'HTML Learner', color: '#3b82f6' };
    if (count <= 6) return { text: 'CSS Designer', color: '#22c55e' };
    if (count <= 9) return { text: 'JS Developer', color: '#f59e0b' };
    if (count < 12) return { text: 'Bootstrap Pro', color: '#8b5cf6' };
    return { text: 'Web Master', color: '#ef4444' };
  };

  // คำนวณจำนวน achievements
  const getAchievementCount = (achievements) => {
    if (!achievements) return 0;
    return Object.values(achievements).filter(a => a.claimed).length;
  };

  // คำนวณคะแนนจากวิดีโอ
  const getVideoQuizStats = (videoQuizProgress) => {
    if (!videoQuizProgress) return { totalPoints: 0, correctAnswers: 0, totalAnswered: 0, videos: [] };

    let totalPoints = 0;
    let correctAnswers = 0;
    let totalAnswered = 0;
    const videos = [];

    for (const [videoId, quizzes] of Object.entries(videoQuizProgress)) {
      const videoInfo = videoList.find(v => v.id === videoId) || {
        id: videoId,
        title: videoId,
        totalQuizzes: Object.keys(quizzes).length,
        pointsPerQuiz: 75
      };

      let videoCorrect = 0;
      let videoAnswered = 0;
      let videoPoints = 0;

      for (const [quizKey, quizData] of Object.entries(quizzes)) {
        totalAnswered++;
        videoAnswered++;

        if (quizData.correct) {
          correctAnswers++;
          videoCorrect++;
          totalPoints += quizData.pointsEarned || videoInfo.pointsPerQuiz;
          videoPoints += quizData.pointsEarned || videoInfo.pointsPerQuiz;
        }
      }

      videos.push({
        ...videoInfo,
        correctAnswers: videoCorrect,
        totalAnswered: videoAnswered,
        pointsEarned: videoPoints
      });
    }

    return { totalPoints, correctAnswers, totalAnswered, videos };
  };

  // คำนวณสถิติคะแนนแต่ละด่าน
  const getLevelScoreStats = (levelScores, completedLevels) => {
    const stats = {
      totalScore: 0,
      passedCount: 0,
      failedCount: 0,
      levels: []
    };

    levelList.forEach(level => {
      const score = levelScores?.[level.number] || levelScores?.[`level${level.number}`] || null;
      const isCompleted = completedLevels?.includes(level.number);
      const isPassed = score !== null && score >= 80;

      if (score !== null) {
        stats.totalScore += score;
        if (isPassed) {
          stats.passedCount++;
        } else {
          stats.failedCount++;
        }
      }

      stats.levels.push({
        ...level,
        score: score,
        isCompleted: isCompleted,
        isPassed: isPassed,
        status: score === null ? 'not_attempted' : (isPassed ? 'passed' : 'failed')
      });
    });

    return stats;
  };

  // เปิด modal แสดงรายละเอียด
  const openUserDetail = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // ปิด modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // ฟังก์ชันลบผู้ใช้งาน
  const handleDeleteUser = async (userId, username) => {
    if (username === 'Phakapon') {
      alert('ไม่สามารถลบผู้ดูแลระบบตัวหลักได้');
      return;
    }

    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}" อย่างถาวร?\n\nคำเตือน: ข้อมูลทั้งหมดรวมถึงคะแนนและประวัติความคืบหน้าจะถูกลบและไม่สามารถกู้คืนได้ และเขาจะสามารถสมัครใหม่ด้วยชื่อผู้ใช้นี้ได้`);

    if (!isConfirmed) return;

    try {
      // อ้างอิงถึงข้อมูลผู้ใช้ในโหนดต่างๆ ของ database
      const userRef = ref(database, `users/${userId}`);
      const userPostTestRef = ref(database, `${username}`);

      // ลบข้อมูลออกให้หมด
      await remove(userRef);
      await remove(userPostTestRef);

      // อัปเดต state ให้ออกจากตารางโชว์
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      alert('ลบผู้ใช้และข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว');

      // ถ้าลบคนที่กำลังเปิด Modal ดูอยู่ ให้ปิด Modal ด้วย
      if (selectedUser?.id === userId) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้: ' + error.message);
    }
  };

  const stats = getStatistics();
  const filteredUsers = getFilteredAndSortedUsers();

  if (loading) {
    return (
      <div className="adm-loading">
        <div className="adm-spinner"></div>
        <h2>กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  return (
    <div className="adm-container">
      {/* Header */}
      <div className="adm-header">
        <h1 className="adm-title">Admin Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="adm-stats">
        <div className="adm-stat-card">
          <div className="adm-stat-icon">👥</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.totalUsers}</div>
            <div className="adm-stat-label">ผู้ใช้ทั้งหมด</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon">⭐</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.totalScore.toLocaleString()}</div>
            <div className="adm-stat-label">คะแนนรวมทั้งหมด</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon">📊</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.averageScore}</div>
            <div className="adm-stat-label">คะแนนเฉลี่ย</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon">🎯</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.completedAllLevels}</div>
            <div className="adm-stat-label">ผ่านครบทุกด่าน</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon">📝</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.completedPostTest}</div>
            <div className="adm-stat-label">ทำ Post-test แล้ว</div>
          </div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon">✅</div>
          <div className="adm-stat-info">
            <div className="adm-stat-value">{stats.passedPostTest}</div>
            <div className="adm-stat-label">ผ่าน Post-test</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="adm-controls">
        <div className="adm-search">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่อหรือ username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adm-search-input"
          />
        </div>
        <div className="adm-filters">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="adm-select"
          >
            <option value="all">ทุกด่าน</option>
            <option value="1">ผ่านด่าน 1</option>
            <option value="3">ผ่าน HTML (ด่าน 3)</option>
            <option value="6">ผ่าน CSS (ด่าน 6)</option>
            <option value="9">ผ่าน JS (ด่าน 9)</option>
            <option value="12">ผ่านครบทุกด่าน</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="adm-select"
          >
            <option value="score">เรียงตามคะแนนเกม</option>
            <option value="progress">เรียงตามความคืบหน้า</option>
            <option value="posttest">เรียงตามคะแนน Post-test</option>
            <option value="name">เรียงตามชื่อ</option>
            <option value="recent">เรียงตามวันที่สมัคร</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อผู้ใช้</th>
              <th>Username</th>
              <th>คะแนนเกม</th>
              <th>ด่านที่ผ่าน</th>
              <th>ระดับ</th>
              <th>Achievements</th>
              <th>คะแนน Post-test</th>
              <th>สถานะ</th>
              <th>วันที่สมัคร</th>
              <th>รายละเอียด</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => {
                const progress = getProgressLevel(user.gameProgress?.completedLevels);
                const completedCount = user.gameProgress?.completedLevels?.length || 0;
                const achievementCount = getAchievementCount(user.gameProgress?.achievements);
                const postTest = user.postTestScore;
                const hasPostTest = postTest !== null;

                return (
                  <tr key={user.id} className={user.username === 'Phakapon' ? 'adm-row-highlight' : ''}>
                    <td className="adm-center">{index + 1}</td>
                    <td>
                      <div className="adm-user-cell">
                        <span className="adm-user-name">{user.fullName || user.username}</span>
                        {user.username === 'Phakapon' && (
                          <span className="adm-badge">ADMIN</span>
                        )}
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td className="adm-center">
                      <span className="adm-score-pill">{user.gameProgress?.totalScore || 0}</span>
                    </td>
                    <td className="adm-center">
                      <div className="adm-progress-cell">
                        <div className="adm-progress-bar">
                          <div
                            className="adm-progress-fill"
                            style={{ width: `${(completedCount / 12) * 100}%` }}
                          ></div>
                        </div>
                        <span className="adm-progress-text">{completedCount}/12</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="adm-level-pill"
                        style={{ backgroundColor: progress.color }}
                      >
                        {progress.text}
                      </span>
                    </td>
                    <td className="adm-center">
                      <span className="adm-ach-count">🏆 {achievementCount}/7</span>
                    </td>
                    <td className="adm-center">
                      {hasPostTest ? (
                        <div className="adm-posttest-cell">
                          <span className="adm-score-pill">{postTest.score}/{postTest.totalQuestions}</span>
                          <span
                            className="adm-percent-pill"
                            style={{ backgroundColor: postTest.passed ? '#22c55e' : '#ef4444' }}
                          >
                            {postTest.percentage.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="adm-empty">-</span>
                      )}
                    </td>
                    <td className="adm-center">
                      {hasPostTest ? (
                        <span className={`adm-status ${postTest.passed ? 'adm-passed' : 'adm-failed'}`}>
                          {postTest.passed ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}
                        </span>
                      ) : (
                        <span className="adm-status adm-pending">⏳ ยังไม่ทำ</span>
                      )}
                    </td>
                    <td className="adm-center">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="adm-center">
                      <button className="adm-detail-btn" onClick={() => openUserDetail(user)}>
                        ดูเพิ่มเติม
                      </button>
                    </td>
                    <td className="adm-center">
                      {user.username !== 'Phakapon' && (
                        <button
                          className="adm-delete-btn"
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id, user.username); }}
                        >
                          ลบผู้ใช้
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="adm-no-data">ไม่พบข้อมูลผู้ใช้</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="adm-modal-overlay" onClick={closeModal}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <button className="adm-modal-close" onClick={closeModal}>×</button>

            {/* Modal Header */}
            <div className="adm-modal-head">
              <div className="adm-modal-avatar">
                {selectedUser.fullName?.charAt(0) || selectedUser.username?.charAt(0) || '?'}
              </div>
              <div className="adm-modal-user">
                <h2>{selectedUser.fullName || selectedUser.username}</h2>
                <p>@{selectedUser.username}</p>
                {selectedUser.username === 'Phakapon' && (
                  <span className="adm-badge-modal">ADMIN</span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="adm-modal-stats">
              <div className="adm-modal-stat">
                <span className="adm-modal-stat-icon">⭐</span>
                <span className="adm-modal-stat-val">{selectedUser.gameProgress?.totalScore || 0}</span>
                <span className="adm-modal-stat-lbl">คะแนน</span>
              </div>
              <div className="adm-modal-stat">
                <span className="adm-modal-stat-icon">📈</span>
                <span className="adm-modal-stat-val">{selectedUser.gameProgress?.completedLevels?.length || 0}/12</span>
                <span className="adm-modal-stat-lbl">ด่าน</span>
              </div>
              <div className="adm-modal-stat">
                <span className="adm-modal-stat-icon">🏆</span>
                <span className="adm-modal-stat-val">{getAchievementCount(selectedUser.gameProgress?.achievements)}/7</span>
                <span className="adm-modal-stat-lbl">รางวัล</span>
              </div>
            </div>

            {/* Level Scores Section - ส่วนใหม่ที่เพิ่ม */}
            {(() => {
              const levelStats = getLevelScoreStats(
                selectedUser.gameProgress?.levelScores,
                selectedUser.gameProgress?.completedLevels
              );

              // จัดกลุ่มด่านตาม category
              const categories = [
                { name: 'HTML', color: '#3b82f6', levels: levelStats.levels.slice(0, 3) },
                { name: 'CSS', color: '#22c55e', levels: levelStats.levels.slice(3, 6) },
                { name: 'JavaScript', color: '#f59e0b', levels: levelStats.levels.slice(6, 9) },
                { name: 'Bootstrap', color: '#8b5cf6', levels: levelStats.levels.slice(9, 12) }
              ];

              return (
                <div className="adm-modal-section">
                  <h3>📊 คะแนนแต่ละด่าน</h3>

                  {/* สรุปรวมคะแนนด่าน */}
                  <div className="adm-level-score-summary">
                    <div className="adm-level-score-stat passed">
                      <span className="adm-level-score-stat-icon">✅</span>
                      <span className="adm-level-score-stat-val">{levelStats.passedCount}</span>
                      <span className="adm-level-score-stat-lbl">ผ่าน</span>
                    </div>
                    <div className="adm-level-score-stat failed">
                      <span className="adm-level-score-stat-icon">❌</span>
                      <span className="adm-level-score-stat-val">{levelStats.failedCount}</span>
                      <span className="adm-level-score-stat-lbl">ไม่ผ่าน</span>
                    </div>
                    <div className="adm-level-score-stat not-attempted">
                      <span className="adm-level-score-stat-icon">⏳</span>
                      <span className="adm-level-score-stat-val">{12 - levelStats.passedCount - levelStats.failedCount}</span>
                      <span className="adm-level-score-stat-lbl">ยังไม่ทำ</span>
                    </div>
                  </div>

                  {/* รายละเอียดคะแนนแต่ละหมวด */}
                  <div className="adm-level-categories">
                    {categories.map((category) => {
                      const categoryTotalScore = category.levels.reduce((sum, l) => sum + (l.score || 0), 0);
                      const categoryAttempted = category.levels.filter(l => l.score !== null).length;

                      return (
                        <div key={category.name} className="adm-level-category">
                          <div className="adm-level-category-header" style={{ backgroundColor: category.color }}>
                            <span className="adm-level-category-name">{category.name}</span>
                            <span className="adm-level-category-score">
                              {categoryAttempted > 0 ? `${categoryTotalScore}/${categoryAttempted * 100}` : '-'}
                            </span>
                          </div>
                          <div className="adm-level-category-items">
                            {category.levels.map((level) => (
                              <div
                                key={level.number}
                                className={`adm-level-score-item ${level.status}`}
                              >
                                <div className="adm-level-score-info">
                                  <span className="adm-level-score-name">
                                    {level.isFinal ? '🔥' : '⭐'} ด่าน {level.number}
                                  </span>
                                  <span className="adm-level-score-label">
                                    {level.isFinal ? 'Final Stage' : level.name}
                                  </span>
                                </div>
                                <div className="adm-level-score-value">
                                  {level.score !== null ? (
                                    <>
                                      <span
                                        className="adm-level-score-number"
                                        style={{
                                          color: level.isPassed ? '#22c55e' : '#ef4444'
                                        }}
                                      >
                                        {level.score}
                                      </span>
                                      <span className="adm-level-score-max">/100</span>
                                      <span
                                        className={`adm-level-score-badge ${level.isPassed ? 'passed' : 'failed'}`}
                                      >
                                        {level.isPassed ? '✓' : '✗'}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="adm-level-score-empty">ยังไม่ทำ</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Video Quiz Progress Section */}
            {(() => {
              const videoStats = getVideoQuizStats(selectedUser.gameProgress?.videoQuizProgress);
              return (
                <div className="adm-modal-section">
                  <h3>🎬 คะแนนจากวิดีโอ</h3>
                  {videoStats.totalAnswered > 0 ? (
                    <>
                      {/* สรุปรวม */}
                      <div className="adm-video-summary">
                        <div className="adm-video-stat">
                          <span className="adm-video-stat-val">{videoStats.totalPoints}</span>
                          <span className="adm-video-stat-lbl">คะแนนรวม</span>
                        </div>
                        <div className="adm-video-stat">
                          <span className="adm-video-stat-val">{videoStats.correctAnswers}/{videoStats.totalAnswered}</span>
                          <span className="adm-video-stat-lbl">ตอบถูก</span>
                        </div>
                        <div className="adm-video-stat">
                          <span className="adm-video-stat-val">
                            {videoStats.totalAnswered > 0
                              ? Math.round((videoStats.correctAnswers / videoStats.totalAnswered) * 100)
                              : 0}%
                          </span>
                          <span className="adm-video-stat-lbl">ความถูกต้อง</span>
                        </div>
                      </div>

                      {/* รายละเอียดแต่ละวิดีโอ */}
                      <div className="adm-video-list">
                        {videoStats.videos.map((video) => (
                          <div key={video.id} className="adm-video-item">
                            <div className="adm-video-info">
                              <span className="adm-video-title">📹 {video.title}</span>
                              <span className="adm-video-progress">
                                ตอบถูก {video.correctAnswers}/{video.totalAnswered} ข้อ
                              </span>
                            </div>
                            <div className="adm-video-points">
                              <span className="adm-video-points-val">+{video.pointsEarned}</span>
                              <span className="adm-video-points-lbl">แต้ม</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="adm-video-empty">
                      <span>📭 ยังไม่ได้ตอบคำถามจากวิดีโอ</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Post-test Section */}
            {selectedUser.postTestScore && (
              <div className="adm-modal-section">
                <h3>📝 ผลสอบ Post-test</h3>
                <div className="adm-posttest-box">
                  <div className="adm-posttest-circle" style={{
                    borderColor: selectedUser.postTestScore.passed ? '#22c55e' : '#ef4444'
                  }}>
                    <span className="adm-posttest-pct">{selectedUser.postTestScore.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="adm-posttest-info">
                    <p className={selectedUser.postTestScore.passed ? 'adm-pass-text' : 'adm-fail-text'}>
                      {selectedUser.postTestScore.passed ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}
                    </p>
                    <p className="adm-posttest-score">{selectedUser.postTestScore.score}/{selectedUser.postTestScore.totalQuestions} คะแนน</p>
                    <p className="adm-posttest-date">{new Date(selectedUser.postTestScore.completedAt).toLocaleString('th-TH')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Levels Progress (Grid แบบเดิม - ย้ายมาอยู่ล่าง) */}
            <div className="adm-modal-section">
              <h3>🎯 ภาพรวมด่านที่ผ่าน</h3>
              <div className="adm-levels-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((level) => {
                  const isCompleted = selectedUser.gameProgress?.completedLevels?.includes(level);
                  const score = selectedUser.gameProgress?.levelScores?.[level] || selectedUser.gameProgress?.levelScores?.[`level${level}`];
                  const categoryColor = level <= 3 ? '#3b82f6' : level <= 6 ? '#22c55e' : level <= 9 ? '#f59e0b' : '#8b5cf6';

                  return (
                    <div
                      key={level}
                      className={`adm-level-box ${isCompleted ? 'adm-level-done' : 'adm-level-lock'}`}
                      style={{ borderColor: isCompleted ? categoryColor : '#e5e7eb' }}
                    >
                      <div className="adm-level-num" style={{ backgroundColor: isCompleted ? categoryColor : '#e5e7eb' }}>
                        {level}
                      </div>
                      <span className="adm-level-score">{isCompleted ? (score || '-') : '🔒'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="adm-modal-section">
              <h3>🏆 Achievements</h3>
              <div className="adm-ach-list">
                {achievementList.map((achievement) => {
                  const isUnlocked = selectedUser.gameProgress?.achievements?.[achievement.id]?.claimed;

                  return (
                    <div
                      key={achievement.id}
                      className={`adm-ach-item ${isUnlocked ? 'adm-ach-unlocked' : 'adm-ach-locked'}`}
                      style={{ borderColor: isUnlocked ? achievement.color : '#e5e7eb' }}
                    >
                      <span className="adm-ach-icon">{achievement.icon}</span>
                      <div className="adm-ach-info">
                        <span className="adm-ach-title" style={{ color: isUnlocked ? achievement.color : '#9ca3af' }}>
                          {achievement.title}
                        </span>
                        <span className="adm-ach-desc">{achievement.description}</span>
                      </div>
                      {isUnlocked ? (
                        <span className="adm-ach-badge" style={{ backgroundColor: achievement.color }}>✓</span>
                      ) : (
                        <span className="adm-ach-lock">🔒</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;