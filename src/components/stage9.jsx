import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/stage3.css'

const Stage9 = () => {
  const navigate = useNavigate();
  const { currentUser, saveUserProgress, getUserProgress } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const LEVEL_NUMBER = 9;
  const PREVIOUS_LEVEL = 8;
  const MIN_PASSING_SCORE = 80;
  const POINTS_PER_QUESTION = 20;

  // คำถาม JavaScript Short Answer (ใช้ข้อสอบชั่วคราว - เปลี่ยนทีหลังได้)
  const questions = [
    { question: "คำสั่งใดใช้สำหรับประกาศตัวแปรที่เปลี่ยนค่าไม่ได้", correctAnswers: ["const", "CONST", "Const"], hint: "ย่อมาจาก constant" },
    { question: "Method ใดใช้สำหรับหาความยาวของ Array", correctAnswers: ["length", "LENGTH", "Length", ".length"], hint: "ไม่ใช่ method แต่เป็น property" },
    { question: "คำสั่งใดใช้สำหรับแสดง popup แจ้งเตือน", correctAnswers: ["alert", "alert()", "ALERT", "Alert"], hint: "แสดงกล่องข้อความบนหน้าเว็บ" },
    { question: "ชนิดข้อมูลใดใช้เก็บค่า true หรือ false", correctAnswers: ["boolean", "Boolean", "BOOLEAN", "bool"], hint: "ค่าความจริง" },
    { question: "Method ใดใช้แปลง String เป็นตัวเลข", correctAnswers: ["parseInt", "parseint", "parseInt()", "ParseInt", "Number"], hint: "แปลงข้อความเป็นจำนวนเต็ม" }
  ];

  useEffect(() => {
    const checkUnlock = async () => {
      if (!currentUser) { navigate('/login'); return; }
      try {
        const progress = await getUserProgress();
        const completedLevels = progress.completedLevels || [];
        const levelScores = progress.levelScores || {};
        const previousPassed = completedLevels.includes(PREVIOUS_LEVEL) && (levelScores[PREVIOUS_LEVEL] || 0) >= MIN_PASSING_SCORE;
        setIsUnlocked(previousPassed);
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    checkUnlock();
  }, [currentUser, getUserProgress, navigate]);

  const saveScore = async (quizScore) => {
    if (!currentUser) return;
    try {
      const progress = await getUserProgress();
      let completedLevels = progress.completedLevels || [];
      let levelScores = progress.levelScores || {};

      const previousScore = levelScores[LEVEL_NUMBER] || 0;
      const wasAlreadyPassed = completedLevels.includes(LEVEL_NUMBER);
      const isPassed = quizScore >= MIN_PASSING_SCORE;

      if (quizScore > previousScore) levelScores[LEVEL_NUMBER] = quizScore;
      if (isPassed && !wasAlreadyPassed) {
        completedLevels = [...completedLevels, LEVEL_NUMBER];
      }

      const scoreDiff = (levelScores[LEVEL_NUMBER] || 0) - previousScore;
      const totalScore = (progress.totalScore || 0) + scoreDiff;

      await saveUserProgress(completedLevels, totalScore, levelScores);
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { score: totalScore, progress: completedLevels, levelScores }
      }));
    } catch (error) { console.error('Error saving score:', error); }
  };

  const checkAnswer = (userInput, correctAnswers) => {
    return correctAnswers.some(correct => userInput.trim().toLowerCase() === correct.toLowerCase());
  };

  const handleAnswerChange = (e) => { if (!answerSubmitted) setUserAnswer(e.target.value); };

  const submitAnswer = () => {
    if (userAnswer.trim() === '') return;
    setAnswerSubmitted(true);
    setShowResult(true);

    const isCorrect = checkAnswer(userAnswer, questions[currentQuestion].correctAnswers);
    let newScore = score;
    if (isCorrect) { newScore = score + POINTS_PER_QUESTION; setScore(newScore); }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setUserAnswer('');
        setShowResult(false);
        setAnswerSubmitted(false);
      } else {
        setFinalScore(newScore);
        setGameCompleted(true);
        saveScore(newScore);
      }
    }, 3000);
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !answerSubmitted && userAnswer.trim() !== '') submitAnswer(); };

  const resetGame = () => {
    setCurrentQuestion(0); setScore(0); setUserAnswer('');
    setShowResult(false); setGameCompleted(false); setAnswerSubmitted(false); setFinalScore(0);
  };

  const getResultClass = () => {
    if (!showResult) return '';
    return checkAnswer(userAnswer, questions[currentQuestion].correctAnswers) ? 'stage3-result-correct' : 'stage3-result-incorrect';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}><h2>กำลังโหลด...</h2></div>;

  if (!isUnlocked) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', maxWidth: '600px', margin: '50px auto', background: '#ffebee', borderRadius: '15px', border: '2px solid #f44336' }}>
        <div style={{ fontSize: '4em', marginBottom: '20px' }}>🔒</div>
        <h2 style={{ color: '#f44336' }}>ด่านนี้ยังล็อคอยู่</h2>
        <p>ต้องผ่านด่าน {PREVIOUS_LEVEL} ด้วยคะแนน 80% ขึ้นไปก่อน</p>
        <button onClick={() => navigate('/')} style={{ padding: '12px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>🏠 กลับหน้าเลือกด่าน</button>
      </div>
    );
  }

  const isPassed = finalScore >= MIN_PASSING_SCORE;
  const correctAnswers = finalScore / POINTS_PER_QUESTION;

  return (
    <div className="stage3-quiz-container">
      <div className="stage3-quiz-header">
        <h1 className="stage3-quiz-title">⚡ Short Answer - Stage 9 (JavaScript Final)</h1>
        <div className="stage3-quiz-info">
          <div className="stage3-info-item"><span className="stage3-info-label">Score</span><span className="stage3-info-value">{score}/100</span></div>
          <div className="stage3-info-item"><span className="stage3-info-label">No.</span><span className="stage3-info-value">{currentQuestion + 1}/{questions.length}</span></div>
          <div className="stage3-info-item"><span className="stage3-info-label">Points/Q</span><span className="stage3-info-value">{POINTS_PER_QUESTION}</span></div>
        </div>
        <div style={{ background: '#fff3e0', padding: '8px 15px', borderRadius: '8px', marginTop: '10px', fontSize: '0.9em', color: '#e65100' }}>
          ⚠️ ต้องได้ {MIN_PASSING_SCORE}/100 คะแนนขึ้นไป (80%) จึงจะผ่านด่าน
        </div>
        <div className="stage3-progress-bar">
          <div className="stage3-progress-fill" style={{ width: `${((currentQuestion + (gameCompleted ? 1 : 0)) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="stage3-quiz-content">
        {!gameCompleted ? (
          <div className="stage3-question-container">
            <div className="stage3-question-number">Question {currentQuestion + 1}</div>
            <div className="stage3-question-text">{questions[currentQuestion].question}</div>
            <div className="stage3-input-hint">💡 {questions[currentQuestion].hint}</div>
            <div className="stage3-text-input-container">
              <input type="text" className="stage3-answer-input" value={userAnswer} onChange={handleAnswerChange} onKeyPress={handleKeyPress} placeholder="พิมพ์คำตอบ..." disabled={answerSubmitted} autoFocus />
              {!answerSubmitted && <button className="stage3-submit-button" onClick={submitAnswer} disabled={userAnswer.trim() === ''}>ยืนยันคำตอบ</button>}
            </div>
            {showResult && (
              <div className={`stage3-result-indicator ${getResultClass()}`}>
                {checkAnswer(userAnswer, questions[currentQuestion].correctAnswers) ? `✅ ถูกต้อง! +${POINTS_PER_QUESTION}` : `❌ ผิด! คำตอบคือ: ${questions[currentQuestion].correctAnswers[0]}`}
              </div>
            )}
          </div>
        ) : (
          <div className="stage3-completion-message">
            {isPassed ? (
              <>
                <div style={{ color: '#4caf50', fontSize: '2.5em', marginBottom: '10px' }}>🎉 ผ่านด่าน!</div>
                <div style={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', padding: '20px 30px', borderRadius: '15px', marginBottom: '25px', fontSize: '1.3em', fontWeight: 'bold' }}>✅ ด่านถัดไปปลดล็อคแล้ว!</div>
              </>
            ) : (
              <>
                <div style={{ color: '#f44336', fontSize: '2.5em', marginBottom: '10px' }}>😢 ไม่ผ่านด่าน</div>
                <div style={{ background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)', color: 'white', padding: '20px 30px', borderRadius: '15px', marginBottom: '25px', fontSize: '1.3em', fontWeight: 'bold' }}>❌ ต้องได้ {MIN_PASSING_SCORE}/100 ขึ้นไป</div>
              </>
            )}
            <div style={{ fontSize: '2em', marginBottom: '15px' }}>คะแนน: {finalScore}/100</div>
            <div style={{ fontSize: '1.3em', color: '#555', marginBottom: '25px', padding: '15px', background: '#f5f5f5', borderRadius: '10px' }}>
              ตอบถูก <strong style={{ color: isPassed ? '#4caf50' : '#f44336' }}>{correctAnswers}</strong> จาก {questions.length} ข้อ
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="stage3-play-again-button" onClick={resetGame} style={{ padding: '15px 30px', fontSize: '1.1em', fontWeight: 'bold' }}> {isPassed ? 'Play Again' : 'Play Again'}</button>
              <button onClick={() => navigate('/')} style={{ padding: '15px 30px', fontSize: '1.1em', fontWeight: 'bold', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Return to the stage selection page</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage9;