// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get, set, push, update } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthState = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuthState();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const { fullName, username, password } = userData;
      
      // Check if username already exists
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const existingUser = Object.values(users).find(user => user.username === username);
        if (existingUser) {
          throw new Error('Username already exists');
        }
      }

      // Create new user
      const newUserRef = push(usersRef);
      const newUser = {
        id: newUserRef.key,
        fullName,
        username,
        password, // ในระบบจริงควรเข้ารหัสรหัสผ่าน
        createdAt: new Date().toISOString(),
        gameProgress: {
          completedLevels: [],
          totalScore: 0,
          levelScores: {},
          achievements: {},
          videoQuizProgress: {} // เพิ่มสำหรับเก็บคะแนนจากวิดีโอ
        }
      };

      await set(newUserRef, newUser);
      return { success: true, message: 'Registration successful!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) {
        throw new Error('No users found');
      }

      const users = snapshot.val();
      const userEntry = Object.entries(users).find(([key, user]) => 
        user.username === username && user.password === password
      );

      if (!userEntry) {
        throw new Error('Invalid username or password');
      }

      const [userId, userData] = userEntry;
      const user = { ...userData, id: userId };

      // Save to localStorage and state
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);

      return { success: true, message: 'Login successful!' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  // Save user progress to Firebase (รองรับ achievements และ videoQuizProgress)
  const saveUserProgress = async (completedLevels, totalScore, levelScores = {}, achievements = null, videoQuizProgress = null) => {
    if (!currentUser) return;

    try {
      const userRef = ref(database, `users/${currentUser.id}`);
      
      // โหลดข้อมูลปัจจุบัน
      const currentData = await get(userRef);
      let existingData = {};
      if (currentData.exists()) {
        existingData = currentData.val().gameProgress || {};
      }

      // ถ้าไม่ได้ส่ง achievements มา ให้ใช้ข้อมูลเดิม
      let achievementsData = achievements;
      if (achievements === null) {
        achievementsData = existingData.achievements || {};
      }

      // ถ้าไม่ได้ส่ง videoQuizProgress มา ให้ใช้ข้อมูลเดิม
      let videoQuizProgressData = videoQuizProgress;
      if (videoQuizProgress === null) {
        videoQuizProgressData = existingData.videoQuizProgress || {};
      }

      const gameProgressData = {
        completedLevels,
        totalScore,
        levelScores,
        achievements: achievementsData,
        videoQuizProgress: videoQuizProgressData
      };

      await update(userRef, {
        gameProgress: gameProgressData
      });

      // Update current user state
      const updatedUser = {
        ...currentUser,
        gameProgress: gameProgressData
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { success: false, message: error.message };
    }
  };

  // Get user progress from Firebase
  const getUserProgress = async () => {
    if (!currentUser) return { 
      completedLevels: [], 
      totalScore: 0, 
      levelScores: {},
      achievements: {},
      videoQuizProgress: {}
    };

    try {
      const userRef = ref(database, `users/${currentUser.id}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const gameProgress = userData.gameProgress || {};
        return {
          completedLevels: gameProgress.completedLevels || [],
          totalScore: gameProgress.totalScore || 0,
          levelScores: gameProgress.levelScores || {},
          achievements: gameProgress.achievements || {},
          videoQuizProgress: gameProgress.videoQuizProgress || {}
        };
      }
      
      return { 
        completedLevels: [], 
        totalScore: 0, 
        levelScores: {},
        achievements: {},
        videoQuizProgress: {}
      };
    } catch (error) {
      console.error('Error getting progress:', error);
      return { 
        completedLevels: [], 
        totalScore: 0, 
        levelScores: {},
        achievements: {},
        videoQuizProgress: {}
      };
    }
  };

  // Save achievement progress specifically
  const saveAchievementProgress = async (achievementId, achievementData) => {
    if (!currentUser) return { success: false, message: 'No user logged in' };

    try {
      const progress = await getUserProgress();
      const updatedAchievements = {
        ...progress.achievements,
        [achievementId]: achievementData
      };

      await saveUserProgress(
        progress.completedLevels,
        progress.totalScore,
        progress.levelScores,
        updatedAchievements,
        progress.videoQuizProgress
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving achievement progress:', error);
      return { success: false, message: error.message };
    }
  };

  // Save video quiz progress specifically
  const saveVideoQuizProgress = async (videoId, quizId, quizData) => {
    if (!currentUser) return { success: false, message: 'No user logged in' };

    try {
      const progress = await getUserProgress();
      const updatedVideoQuizProgress = {
        ...progress.videoQuizProgress,
        [videoId]: {
          ...(progress.videoQuizProgress[videoId] || {}),
          [`quiz_${quizId}`]: quizData
        }
      };

      await saveUserProgress(
        progress.completedLevels,
        progress.totalScore,
        progress.levelScores,
        progress.achievements,
        updatedVideoQuizProgress
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving video quiz progress:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    loading,
    saveUserProgress,
    getUserProgress,
    saveAchievementProgress,
    saveVideoQuizProgress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};