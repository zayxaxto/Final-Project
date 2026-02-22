import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import '../css/html.css';
import { useAuth } from '../contexts/AuthContext';

// คะแนนต่อคำถาม
const SCORE_PER_QUESTION = 75;

// URL วิดีโอ YouTube (แก้เป็น URL ที่ต้องการ)
const YOUTUBE_URL = 'https://youtu.be/KLyZ22CF5bA';

// ข้อมูลคำถามแบบทดสอบ
const quizData = [
  {
    id: 1,
    triggerTime: 143, // วินาทีที่ 30
    question: "ส่วนของเอกสาร HTML ที่ใช้สำหรับกำหนดชื่อเพจที่จะปรากฏบนแท็บเบราว์เซอร์ ควรถูกกำหนดไว้ในแท็กใด",
    options: [
      { id: 'a', text: "<body>" },
      { id: 'b', text: "<title>" },
      { id: 'c', text: "<meta>" },
      { id: 'd', text: "<head>" }
    ],
    correctAnswer: 'b'
  },
  {
    id: 2,
    triggerTime: 585, // วินาทีที่ 60
    question: "แอตทริบิวต์ alt ในแท็ก <img> มีความสำคัญอย่างไร",
    options: [
      { id: 'a', text: "ใช้กำหนดขนาดความกว้างและความสูงของรูปภาพ" },
      { id: 'b', text: "ใช้กำหนดชื่อไฟล์รูปภาพที่ใช้ในการจัดเก็บ" },
      { id: 'c', text: "ใช้กำหนดข้อความสำรองที่จะแสดงเมื่อรูปภาพไม่สามารถโหลดได้" },
      { id: 'd', text: "ใช้กำหนดชื่อกลุ่มของรูปภาพสำหรับเรียกใช้งานด้วย" }
    ],
    correctAnswer: 'c'
  }
];

// Video ID สำหรับระบุว่าเป็นวิดีโอไหน (ใช้แยกข้อมูลถ้ามีหลายวิดีโอ)
const VIDEO_ID = 'html_video_1';

const VideoQuizPlayer = () => {
  const { currentUser, getUserProgress, saveUserProgress } = useAuth();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [score, setScore] = useState(0);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState([]);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // เก็บข้อมูลคำถามที่เคยตอบแล้ว (จาก Firebase)
  const [answeredQuizzes, setAnsweredQuizzes] = useState({});
  const [alreadyAnsweredMessage, setAlreadyAnsweredMessage] = useState(false);

  const playerRef = useRef(null);

  // โหลดข้อมูลผู้ใช้เมื่อเริ่มต้น
  useEffect(() => {
    const loadProgress = async () => {
      if (currentUser) {
        const progress = await getUserProgress();
        // โหลดข้อมูลคำถามที่เคยตอบแล้ว
        const videoQuizProgress = progress.videoQuizProgress || {};
        const currentVideoAnswered = videoQuizProgress[VIDEO_ID] || {};
        setAnsweredQuizzes(currentVideoAnswered);

        // คำนวณคะแนนที่เคยได้จากวิดีโอนี้
        let previousPoints = 0;
        Object.values(currentVideoAnswered).forEach(quiz => {
          if (quiz.correct) {
            previousPoints += SCORE_PER_QUESTION;
          }
        });
        setEarnedPoints(previousPoints);
      }
    };
    loadProgress();
  }, [currentUser, getUserProgress]);

  // ตรวจสอบเวลาและแสดงคำถาม
  const handleProgress = (state) => {
    const playedSeconds = state.playedSeconds;
    setCurrentTime(Math.floor(playedSeconds));

    if (playedSeconds > maxWatchedTime) {
      setMaxWatchedTime(playedSeconds);
    }

    quizData.forEach(quiz => {
      const currentSecond = Math.floor(playedSeconds);
      if (
        currentSecond >= quiz.triggerTime &&
        currentSecond < quiz.triggerTime + 2 &&
        !triggeredQuizzes.includes(quiz.id) &&
        !completedQuizzes.includes(quiz.id)
      ) {
        setTriggeredQuizzes(prev => [...prev, quiz.id]);
        setPlaying(false);
        setCurrentQuiz(quiz);
        setShowQuiz(true);
        setSelectedAnswer(null);
        setShowFeedback(false);

        // ตรวจสอบว่าเคยตอบคำถามนี้แล้วหรือยัง
        const quizKey = `quiz_${quiz.id}`;
        if (answeredQuizzes[quizKey]) {
          setAlreadyAnsweredMessage(true);
        } else {
          setAlreadyAnsweredMessage(false);
        }
      }
    });
  };

  // ป้องกันการกรอวิดีโอไปข้างหน้า
  const handleSeek = (seconds) => {
    if (seconds > maxWatchedTime + 1) {
      playerRef.current.seekTo(maxWatchedTime, 'seconds');
    }
  };

  // บันทึกคะแนนและข้อมูลคำถามลง Firebase
  const saveQuizAnswerToFirebase = async (quizId, isCorrect, pointsToAdd) => {
    if (!currentUser) return;

    try {
      const progress = await getUserProgress();

      // อัพเดทข้อมูลคำถามที่ตอบแล้ว
      const videoQuizProgress = progress.videoQuizProgress || {};
      const currentVideoProgress = videoQuizProgress[VIDEO_ID] || {};

      const quizKey = `quiz_${quizId}`;
      currentVideoProgress[quizKey] = {
        answeredAt: new Date().toISOString(),
        correct: isCorrect,
        pointsEarned: isCorrect ? pointsToAdd : 0
      };

      videoQuizProgress[VIDEO_ID] = currentVideoProgress;

      // คำนวณคะแนนใหม่
      const newTotalScore = (progress.totalScore || 0) + pointsToAdd;

      // บันทึกทั้งหมดพร้อมกัน
      await saveUserProgress(
        progress.completedLevels || [],
        newTotalScore,
        progress.levelScores || {},
        progress.achievements || {},
        videoQuizProgress
      );

      // อัพเดท state
      setAnsweredQuizzes(currentVideoProgress);

      // อัพเดท Navbar
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { score: newTotalScore }
      }));

      console.log(`บันทึกคะแนน +${pointsToAdd} สำเร็จ! รวม: ${newTotalScore}`);
    } catch (error) {
      console.error('Error saving quiz answer:', error);
    }
  };

  // จัดการเมื่อเลือกคำตอบ
  const handleSelectAnswer = async (optionId) => {
    if (showFeedback) return;

    setSelectedAnswer(optionId);
    setShowFeedback(true);

    const quizKey = `quiz_${currentQuiz.id}`;
    const alreadyAnswered = answeredQuizzes[quizKey];
    const isCorrect = optionId === currentQuiz.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);

      // ให้คะแนนเฉพาะถ้ายังไม่เคยตอบถูกมาก่อน
      if (!alreadyAnswered) {
        setEarnedPoints(prev => prev + SCORE_PER_QUESTION);
        await saveQuizAnswerToFirebase(currentQuiz.id, true, SCORE_PER_QUESTION);
      }
    } else {
      // บันทึกว่าตอบแล้ว แต่ไม่ได้คะแนน (ถ้ายังไม่เคยตอบ)
      if (!alreadyAnswered) {
        await saveQuizAnswerToFirebase(currentQuiz.id, false, 0);
      }
    }
  };

  // ดำเนินการต่อหลังตอบคำถาม
  const handleContinue = () => {
    setCompletedQuizzes(prev => [...prev, currentQuiz.id]);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAlreadyAnsweredMessage(false);
    setPlaying(true);
  };

  // รีเซ็ตทั้งหมด (ไม่รีเซ็ตคะแนนใน Firebase)
  const handleReset = () => {
    setPlaying(false);
    setCurrentTime(0);
    setShowQuiz(false);
    setCurrentQuiz(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCompletedQuizzes([]);
    setTriggeredQuizzes([]);
    setScore(0);
    setMaxWatchedTime(0);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  // Format เวลา
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ตรวจสอบสถานะตัวเลือก
  const getOptionClass = (optionId) => {
    if (!showFeedback) {
      return selectedAnswer === optionId ? 'selected' : '';
    }
    if (optionId === currentQuiz.correctAnswer) {
      return 'correct';
    }
    if (selectedAnswer === optionId && optionId !== currentQuiz.correctAnswer) {
      return 'incorrect';
    }
    return '';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>🎬 Interactive Video Learning</h1>
        <p>วิดีโอพร้อมแบบทดสอบระหว่างเรียน</p>
      </div>

      {/* Video Container */}
      <div className="video-container">
        <div className="video-wrapper">
          <ReactPlayer
            ref={playerRef}
            url={YOUTUBE_URL}
            playing={playing}
            controls={true}
            width="100%"
            height="400px"
            onProgress={handleProgress}
            onSeek={handleSeek}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0
                }
              }
            }}
            style={{ borderRadius: '12px', overflow: 'hidden' }}
          />
        </div>

        {/* Progress Info */}
        <div className="progress-info">
          <div className="time-display">
            <svg className="time-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z" />
            </svg>
            <span>เวลา: {formatTime(currentTime)}</span>
          </div>

          <div className="quiz-status">
            {quizData.map((quiz, index) => {
              const quizKey = `quiz_${quiz.id}`;
              const wasAnswered = answeredQuizzes[quizKey];
              const wasCorrect = wasAnswered?.correct;

              return (
                <span
                  key={quiz.id}
                  className={`status-badge ${completedQuizzes.includes(quiz.id) || wasAnswered
                    ? (wasCorrect ? 'completed' : 'answered-wrong')
                    : 'pending'
                    }`}
                  title={wasAnswered ? (wasCorrect ? 'ตอบถูก' : 'ตอบผิด') : 'ยังไม่ตอบ'}
                >
                  Q{index + 1} {wasAnswered ? (wasCorrect ? '✓' : '✗') : ''}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quiz Overlay */}
      {showQuiz && currentQuiz && (
        <div className="quiz-overlay">
          <div className="quiz-modal">
            <div className="quiz-header">
              <div className="quiz-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
              </div>
              <h2>คำถามแบบทดสอบ</h2>
              <span className="quiz-number">ข้อที่ {currentQuiz.id} จาก {quizData.length}</span>

              {/* แสดงข้อความว่าเคยตอบแล้ว */}
              {alreadyAnsweredMessage ? (
                <p style={{ color: '#f97316', fontSize: '0.9rem', marginTop: '8px' }}>
                  ⚠️ คุณเคยตอบคำถามนี้แล้ว (คะแนนจะไม่เพิ่ม)
                </p>
              ) : (
                <p style={{ color: '#4facfe', fontSize: '0.9rem', marginTop: '8px' }}>
                  ⭐ ตอบถูกได้ {SCORE_PER_QUESTION} แต้ม
                </p>
              )}
            </div>

            <div className="question">
              <p>{currentQuiz.question}</p>
            </div>

            <div className="options">
              {currentQuiz.options.map((option) => (
                <button
                  key={option.id}
                  className={`option-btn ${getOptionClass(option.id)}`}
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">{option.id.toUpperCase()}</span>
                  <span className="option-text">{option.text}</span>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`feedback ${selectedAnswer === currentQuiz.correctAnswer ? 'correct' : 'incorrect'}`}>
                <p>
                  {selectedAnswer === currentQuiz.correctAnswer
                    ? (alreadyAnsweredMessage
                      ? `ถูกต้อง! (เคยตอบแล้ว ไม่ได้คะแนนเพิ่ม)`
                      : `ถูกต้อง +${SCORE_PER_QUESTION} คะแนน`)
                    : (alreadyAnsweredMessage
                      ? `ไม่ถูกต้อง คำตอบที่ถูกต้องคือ ${currentQuiz.correctAnswer.toUpperCase()} (เคยตอบแล้ว)`
                      : `ไม่ถูกต้อง คำตอบที่ถูกต้องคือ ${currentQuiz.correctAnswer.toUpperCase()}`)
                  }
                </p>
              </div>
            )}

            {showFeedback && (
              <button className="continue-btn" onClick={handleContinue}>
                Continue watching the video
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQuizPlayer;