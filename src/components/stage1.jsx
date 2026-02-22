import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/stage1.css'

const Stage1 = () => {
  const navigate = useNavigate();
  const { currentUser, saveUserProgress, getUserProgress } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const LEVEL_NUMBER = 1;
  const MIN_PASSING_SCORE = 80;
  const POINTS_PER_QUESTION = 20;

  const questions = [
    { question: "นิยามของ เว็บไซต์ ที่ถูกต้องที่สุดคืออะไร", options: ["กลุ่มของเว็บเพจหลายหน้าที่เชื่อมโยงถึงกันและเข้าถึงผ่าน Web Server ด้วยโดเมนเดียวกัน", "โปรแกรมสำหรับแสดงผลข้อมูลจากฐานข้อมูลของเซิร์ฟเวอร์", "ภาษาที่ใช้ในการเขียนโปรแกรมเพื่อสร้างแอปพลิเคชันบนอินเทอร์เน็ต", "เอกสาร HTML เพียงหน้าเดียวที่ใช้ในการนำเสนอข้อมูล"], correct: 0 },
    { question: "ภาษา HTML จัดเป็นภาษาประเภทใด", options: ["Programming Language", "Style Sheet Language", "Markup Language", "Scripting Language"], correct: 2 },
    { question: "ข้อใดเป็นตัวอย่างการวางแท็กซ้อนกัน (Nested Elements) ที่ถูกต้อง", options: ["<p><b> ข้อความตัวหนา </b></p>", "<b><i> ข้อความตัวหนาและเอียง </b></i>", "<title><head> ชื่อเว็บ </head></title>", "<body><html> เนื้อหาเว็บ </html></body>"], correct: 0 },
    { question: "แท็กใดในมาตรฐาน HTML5 ที่ถูกเพิ่มเข้ามาเพื่อใช้จัดการแสดงผลไฟล์วิดีโอแทนการใช้เทคโนโลยีเดิม", options: ["<object>", "<embed>", "<source>", "<video>"], correct: 3 },
    { question: "แท็กใดที่ต้องอยู่เป็นบรรทัดแรกสุดของเอกสาร HTML5 เสมอ", options: ["<html>", "<head>", "<!DOCTYPE html>", "<body>"], correct: 2 }
  ];

  // บันทึกคะแนนลง Firebase - totalScore = ผลรวมคะแนน Quiz ทุกด่าน
  const saveScore = async (quizScore) => {
    if (!currentUser) return;

    try {
      const progress = await getUserProgress();
      let completedLevels = progress.completedLevels || [];
      let levelScores = progress.levelScores || {};

      const previousScore = levelScores[LEVEL_NUMBER] || 0;
      const wasAlreadyPassed = completedLevels.includes(LEVEL_NUMBER);
      const isPassed = quizScore >= MIN_PASSING_SCORE;

      // อัพเดทคะแนน quiz ของด่านนี้ (เก็บคะแนนสูงสุด)
      if (quizScore > previousScore) {
        levelScores[LEVEL_NUMBER] = quizScore;
      }

      // ถ้าผ่านครั้งแรก ให้เพิ่มเข้า completedLevels
      if (isPassed && !wasAlreadyPassed) {
        completedLevels = [...completedLevels, LEVEL_NUMBER];
      }

      // คำนวณ totalScore = คะแนนเดิม + ส่วนต่างคะแนนของด่านนี้
      // วิธีนี้จะช่วยรักษาคะแนนจาก Video Quiz และ Achievements ไว้
      const scoreDiff = (levelScores[LEVEL_NUMBER] || 0) - previousScore;
      const totalScore = (progress.totalScore || 0) + scoreDiff;

      // บันทึกลง Firebase
      await saveUserProgress(completedLevels, totalScore, levelScores);

      // ส่ง event อัพเดท navbar
      window.dispatchEvent(new CustomEvent('scoreUpdated', {
        detail: {
          score: totalScore,  // ผลรวมคะแนน Quiz ทุกด่าน
          progress: completedLevels,
          levelScores: levelScores
        }
      }));

      console.log(`Stage ${LEVEL_NUMBER}: Quiz=${quizScore}, TotalScore=${totalScore}`);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!answerSubmitted) setSelectedAnswer(answerIndex);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;

    setAnswerSubmitted(true);
    setShowResult(true);

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    let newScore = score;
    if (isCorrect) {
      newScore = score + POINTS_PER_QUESTION;
      setScore(newScore);
    }

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
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setAnswerSubmitted(false);
    setFinalScore(0);
  };

  const getAnswerClass = (index) => {
    if (!showResult) return selectedAnswer === index ? 'stage1-selected' : '';
    if (index === questions[currentQuestion].correct) return 'stage1-correct';
    if (index === selectedAnswer && selectedAnswer !== questions[currentQuestion].correct) return 'stage1-incorrect';
    return '';
  };

  const isPassed = finalScore >= MIN_PASSING_SCORE;
  const correctAnswers = finalScore / POINTS_PER_QUESTION;

  return (
    <div className="stage1-quiz-container">
      <div className="stage1-quiz-header">
        <h1 className="stage1-quiz-title">🧠 Quiz Challenge - Stage 1 (HTML)</h1>
        <div className="stage1-quiz-info">
          <div className="stage1-info-item">
            <span className="stage1-info-label">Score</span>
            <span className="stage1-info-value">{score}/100</span>
          </div>
          <div className="stage1-info-item">
            <span className="stage1-info-label">No.</span>
            <span className="stage1-info-value">{currentQuestion + 1}/{questions.length}</span>
          </div>
          <div className="stage1-info-item">
            <span className="stage1-info-label">Points/Q</span>
            <span className="stage1-info-value">{POINTS_PER_QUESTION}</span>
          </div>
        </div>
        <div style={{ background: '#fff3e0', padding: '8px 15px', borderRadius: '8px', marginTop: '10px', fontSize: '0.9em', color: '#e65100' }}>
          ⚠️ ต้องได้ {MIN_PASSING_SCORE}/100 คะแนนขึ้นไป (80%) จึงจะผ่านด่านและปลดล็อคด่านถัดไป
        </div>
        <div className="stage1-progress-bar">
          <div className="stage1-progress-fill" style={{ width: `${((currentQuestion + (gameCompleted ? 1 : 0)) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="stage1-quiz-content">
        {!gameCompleted ? (
          <div className="stage1-question-container">
            <div className="stage1-question-number">Question {currentQuestion + 1}</div>
            <div className="stage1-question-text">{questions[currentQuestion].question}</div>
            <div className="stage1-options-container">
              {questions[currentQuestion].options.map((option, index) => (
                <button key={index} className={`stage1-option-button ${getAnswerClass(index)}`} onClick={() => handleAnswerSelect(index)} disabled={answerSubmitted}>
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </div>
            {showResult && (
              <div className={`stage1-result-indicator ${selectedAnswer === questions[currentQuestion].correct ? 'stage1-result-correct' : 'stage1-result-incorrect'}`}>
                {selectedAnswer === questions[currentQuestion].correct ? `✅ ถูกต้อง! +${POINTS_PER_QUESTION} คะแนน` : `❌ ผิด! คำตอบที่ถูกคือ ${String.fromCharCode(65 + questions[currentQuestion].correct)}`}
              </div>
            )}
            {!answerSubmitted && (
              <button className="stage1-submit-button" onClick={submitAnswer} disabled={selectedAnswer === null}>ยืนยันคำตอบ</button>
            )}
          </div>
        ) : (
          <div className="stage1-completion-message">
            {isPassed ? (
              <>
                <div style={{ color: '#4caf50', fontSize: '2.5em', marginBottom: '10px' }}>🎉 ผ่านด่าน!</div>
                <div style={{ background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)', color: 'white', padding: '20px 30px', borderRadius: '15px', marginBottom: '25px', fontSize: '1.3em', fontWeight: 'bold' }}>
                  ✅ คะแนนผ่านเกณฑ์ 80% - ด่านถัดไปปลดล็อคแล้ว!
                </div>
              </>
            ) : (
              <>
                <div style={{ color: '#f44336', fontSize: '2.5em', marginBottom: '10px' }}>😢 ไม่ผ่านด่าน</div>
                <div style={{ background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)', color: 'white', padding: '20px 30px', borderRadius: '15px', marginBottom: '25px', fontSize: '1.3em', fontWeight: 'bold' }}>
                  ❌ ต้องได้ {MIN_PASSING_SCORE}/100 ขึ้นไป
                </div>
              </>
            )}
            <div style={{ fontSize: '2em', marginBottom: '15px' }}>คะแนน Quiz: {finalScore}/100</div>
            <div style={{ fontSize: '1.3em', color: '#555', marginBottom: '25px', padding: '15px', background: '#f5f5f5', borderRadius: '10px' }}>
              ตอบถูก <strong style={{ color: isPassed ? '#4caf50' : '#f44336' }}>{correctAnswers}</strong> จาก {questions.length} ข้อ
              {finalScore === 100 && <div style={{ color: '#4caf50', fontWeight: 'bold', marginTop: '15px' }}>🏆 คะแนนเต็ม!</div>}
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="stage1-play-again-button" onClick={resetGame} style={{ padding: '15px 30px', fontSize: '1.1em', fontWeight: 'bold' }}>
                {isPassed ? 'Play Again' : 'Play Again'}
              </button>
              <button onClick={() => navigate('/')} style={{ padding: '15px 30px', fontSize: '1.1em', fontWeight: 'bold', background: '#667eea', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                Return to the stage selection page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage1;