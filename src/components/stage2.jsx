import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/stage2.css'

const Stage2 = () => {
  const navigate = useNavigate();
  const { currentUser, saveUserProgress, getUserProgress } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const LEVEL_NUMBER = 2;
  const PREVIOUS_LEVEL = 1;
  const MIN_PASSING_SCORE = 80;
  const POINTS_PER_QUESTION = 20;

  const questions = [
    { question: "ในภาษา HTML คำว่า อิลิเมนต์ (Element) หมายถึง องค์ประกอบทั้งหมด ตั้งแต่แท็กเปิด เนื้อหา ไปจนถึงแท็กปิด", correct: true },
    { question: "หากต้องการกำหนดให้ข้อความเป็นหัวข้อหลักที่สำคัญที่สุด ควรใช้แท็ก <title>", correct: false },
    { question: "แท็กที่ใช้สำหรับขึ้นบรรทัดใหม่โดยไม่ต้องเริ่มต้นย่อหน้าใหม่ และถือเป็น Void Element คือแท็ก <hr>", correct: false },
    { question: "หากต้องการสร้างรายการเมนูที่ใช้สัญลักษณ์จุดนำหน้า ควรใช้แท็กหลักคือ <ol> และแท็กย่อยคือ <li>", correct: true },
    { question: "แท็ก <ol> และ <ul> ต่างกันที่ฟังก์ชันรูปแบบการแสดงผลของตัวนำหน้ารายการ", correct: true }
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

      // คำนวณ totalScore ใหม่โดยใช้ผลต่าง
      const scoreDiff = (levelScores[LEVEL_NUMBER] || 0) - previousScore;
      const totalScore = (progress.totalScore || 0) + scoreDiff;

      await saveUserProgress(completedLevels, totalScore, levelScores);
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: { score: totalScore, progress: completedLevels, levelScores }
      }));
    } catch (error) { console.error('Error saving score:', error); }
  };

  const handleAnswerSelect = (answer) => { if (!answerSubmitted) setSelectedAnswer(answer); };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswerSubmitted(true);
    setShowResult(true);

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    let newScore = score;
    if (isCorrect) { newScore = score + POINTS_PER_QUESTION; setScore(newScore); }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setAnswerSubmitted(false);
      } else {
        setFinalScore(newScore);
        setGameCompleted(true);
        saveScore(newScore);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestion(0); setScore(0); setSelectedAnswer(null);
    setShowResult(false); setGameCompleted(false); setAnswerSubmitted(false); setFinalScore(0);
  };

  const getAnswerClass = (answer) => {
    if (!showResult) return selectedAnswer === answer ? 'stage2-selected' : '';
    if (answer === questions[currentQuestion].correct) return 'stage2-correct';
    if (answer === selectedAnswer && selectedAnswer !== questions[currentQuestion].correct) return 'stage2-incorrect';
    return '';
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
    <div className="stage2-quiz-container">
      <div className="stage2-quiz-header">
        <h1 className="stage2-quiz-title">🧠 True or False - Stage 2 (HTML)</h1>
        <div className="stage2-quiz-info">
          <div className="stage2-info-item"><span className="stage2-info-label">Score</span><span className="stage2-info-value">{score}/100</span></div>
          <div className="stage2-info-item"><span className="stage2-info-label">No.</span><span className="stage2-info-value">{currentQuestion + 1}/{questions.length}</span></div>
          <div className="stage2-info-item"><span className="stage2-info-label">Points/Q</span><span className="stage2-info-value">{POINTS_PER_QUESTION}</span></div>
        </div>
        <div style={{ background: '#fff3e0', padding: '8px 15px', borderRadius: '8px', marginTop: '10px', fontSize: '0.9em', color: '#e65100' }}>
          ⚠️ ต้องได้ {MIN_PASSING_SCORE}/100 คะแนนขึ้นไป (80%) จึงจะผ่านด่าน
        </div>
        <div className="stage2-progress-bar">
          <div className="stage2-progress-fill" style={{ width: `${((currentQuestion + (gameCompleted ? 1 : 0)) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="stage2-quiz-content">
        {!gameCompleted ? (
          <div className="stage2-question-container">
            <div className="stage2-question-number">Question {currentQuestion + 1}</div>
            <div className="stage2-question-text">{questions[currentQuestion].question}</div>
            <div className="stage2-true-false-container">
              <button className={`stage2-tf-button stage2-tf-true ${getAnswerClass(true)}`} onClick={() => handleAnswerSelect(true)} disabled={answerSubmitted}>✓ True</button>
              <button className={`stage2-tf-button stage2-tf-false ${getAnswerClass(false)}`} onClick={() => handleAnswerSelect(false)} disabled={answerSubmitted}>✗ False</button>
            </div>
            {showResult && (
              <div className={`stage2-result-indicator ${selectedAnswer === questions[currentQuestion].correct ? 'stage2-result-correct' : 'stage2-result-incorrect'}`}>
                {selectedAnswer === questions[currentQuestion].correct ? `✅ ถูกต้อง! +${POINTS_PER_QUESTION}` : `❌ ผิด! คำตอบคือ ${questions[currentQuestion].correct ? 'True' : 'False'}`}
              </div>
            )}
            {!answerSubmitted && <button className="stage2-submit-button" onClick={submitAnswer} disabled={selectedAnswer === null}>ยืนยันคำตอบ</button>}
          </div>
        ) : (
          <div className="stage2-completion-message">
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
            <div className="stage-final-score-text" style={{ fontSize: "2em", marginBottom: "15px" }}>คะแนน: {finalScore}/100</div>
            <div className="stage-correct-review-text" style={{ fontSize: "1.3em", marginBottom: "25px", padding: "15px", borderRadius: "10px" }}>
              ตอบถูก <strong style={{ color: isPassed ? '#4caf50' : '#f44336' }}>{correctAnswers}</strong> จาก {questions.length} ข้อ
            </div>
            <div className="stage-action-buttons">
              <button className="stage-btn stage-btn-primary" onClick={resetGame}>
                ↻ {isPassed ? 'Play Again' : 'Try Again'}
              </button>
              <button className="stage-btn stage-btn-secondary" onClick={() => navigate('/')}>
                🏠 Return to Stages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage2;