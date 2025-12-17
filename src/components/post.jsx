import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import { ref, update, get } from 'firebase/database';
import '../css/posttest.css';

const PostTest = () => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // โหลดคะแนนเดิมจาก Firebase
    const loadPreviousScore = async () => {
      if (currentUser) {
        try {
          // ใช้ currentUser.id แทน currentUser.username
          const userRef = ref(database, `users/${currentUser.id}/postTestScore`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            setPreviousScore(snapshot.val());
            console.log('Previous score loaded:', snapshot.val());
          } else {
            console.log('No previous post-test score found');
          }
        } catch (error) {
          console.error('Error loading previous score:', error);
        }
      }
    };
    loadPreviousScore();
  }, [currentUser]);

  const questions = [
    {
      id: 1,
      question: "HTML ย่อมาจากอะไร?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "Tag ใดใช้สำหรับสร้างหัวข้อขนาดใหญ่ที่สุดใน HTML?",
      options: [
        "<head>",
        "<h6>",
        "<heading>",
        "<h1>"
      ],
      correct: 3
    },
    {
      id: 3,
      question: "คุณสมบัติใดใช้เปลี่ยนสีพื้นหลังใน CSS?",
      options: [
        "bgcolor",
        "color",
        "background-color",
        "bg-color"
      ],
      correct: 2
    },
    {
      id: 4,
      question: "Tag ใดใช้สำหรับสร้างลิงก์ใน HTML?",
      options: [
        "<link>",
        "<a>",
        "<href>",
        "<url>"
      ],
      correct: 1
    },
    {
      id: 5,
      question: "CSS ย่อมาจากอะไร?",
      options: [
        "Computer Style Sheets",
        "Creative Style Sheets",
        "Cascading Style Sheets",
        "Colorful Style Sheets"
      ],
      correct: 2
    },
    {
      id: 6,
      question: "วิธีใดใช้แทรก JavaScript ภายนอกใน HTML?",
      options: [
        "<script href='file.js'>",
        "<script name='file.js'>",
        "<script src='file.js'>",
        "<javascript src='file.js'>"
      ],
      correct: 2
    },
    {
      id: 7,
      question: "Tag ใดใช้สำหรับแสดงรูปภาพใน HTML?",
      options: [
        "<image>",
        "<img>",
        "<picture>",
        "<photo>"
      ],
      correct: 1
    },
    {
      id: 8,
      question: "คำสั่งใดใช้แสดงข้อความใน Console ของ JavaScript?",
      options: [
        "print()",
        "console.log()",
        "alert()",
        "display()"
      ],
      correct: 1
    },
    {
      id: 9,
      question: "คุณสมบัติใดใช้จัดข้อความให้อยู่กึ่งกลางใน CSS?",
      options: [
        "align: center",
        "text-align: center",
        "text-center: true",
        "align-text: center"
      ],
      correct: 1
    },
    {
      id: 10,
      question: "Tag ใดใช้สร้างรายการแบบมีลำดับเลข?",
      options: [
        "<ul>",
        "<list>",
        "<ol>",
        "<dl>"
      ],
      correct: 2
    },
    {
      id: 11,
      question: "Bootstrap เป็นอะไร?",
      options: [
        "ภาษาโปรแกรม",
        "CSS Framework",
        "JavaScript Library",
        "Database"
      ],
      correct: 1
    },
    {
      id: 12,
      question: "Selector ใดเลือก element ที่มี id='demo' ใน CSS?",
      options: [
        ".demo",
        "*demo",
        "#demo",
        "demo"
      ],
      correct: 2
    },
    {
      id: 13,
      question: "Tag ใดใช้สร้างตารางใน HTML?",
      options: [
        "<table>",
        "<tab>",
        "<grid>",
        "<data>"
      ],
      correct: 0
    },
    {
      id: 14,
      question: "คุณสมบัติใดใช้กำหนดความกว้างของ element ใน CSS?",
      options: [
        "size",
        "width",
        "length",
        "w"
      ],
      correct: 1
    },
    {
      id: 15,
      question: "var, let, const ใช้ทำอะไรใน JavaScript?",
      options: [
        "สร้าง function",
        "ประกาศตัวแปร",
        "สร้าง loop",
        "สร้าง object"
      ],
      correct: 1
    },
    {
      id: 16,
      question: "Tag ใดใช้สำหรับสร้างปุ่มใน HTML?",
      options: [
        "<btn>",
        "<input type='button'>",
        "<button>",
        "ทั้ง B และ C"
      ],
      correct: 3
    },
    {
      id: 17,
      question: "คุณสมบัติใดใช้เปลี่ยนสีตัวอักษรใน CSS?",
      options: [
        "text-color",
        "font-color",
        "color",
        "text-style"
      ],
      correct: 2
    },
    {
      id: 18,
      question: "Tag ใดใช้สำหรับสร้าง dropdown list?",
      options: [
        "<list>",
        "<dropdown>",
        "<select>",
        "<option>"
      ],
      correct: 2
    },
    {
      id: 19,
      question: "Class ใน Bootstrap ที่ทำให้ปุ่มมีสีน้ำเงิน?",
      options: [
        "btn-blue",
        "btn-primary",
        "btn-info",
        "button-blue"
      ],
      correct: 1
    },
    {
      id: 20,
      question: "<!DOCTYPE html> มีความหมายว่าอย่างไร?",
      options: [
        "เป็นการกำหนดชื่อเอกสาร",
        "เป็นการบอกว่าเป็น HTML5",
        "เป็นการสร้างหัวข้อ",
        "ไม่มีความหมาย"
      ],
      correct: 1
    }
  ];

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบว่าตอบครบทุกข้อหรือไม่
    if (Object.keys(answers).length < questions.length) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    // คำนวณคะแนน
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const newScore = correctCount;
    setScore(newScore);
    setSubmitted(true);

    // บันทึกคะแนนลง Firebase
    if (currentUser) {
      try {
        // ใช้ currentUser.id แทน currentUser.username
        const userRef = ref(database, `users/${currentUser.id}`);
        const postTestData = {
          score: newScore,
          totalQuestions: questions.length,
          percentage: (newScore / questions.length) * 100,
          completedAt: new Date().toISOString(),
          passed: (newScore / questions.length) * 100 >= 60
        };

        await update(userRef, {
          postTestScore: postTestData
        });

        console.log('Post-test score saved successfully!', {
          path: `users/${currentUser.id}`,
          data: postTestData
        });
      } catch (error) {
        console.error('Error saving post-test score:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกคะแนน');
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    if (window.confirm('คุณต้องการทำแบบทดสอบใหม่หรือไม่?')) {
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (submitted) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 60;

    return (
      <div className="posttest-container">
        <div className="posttest-result">
          <div className={`result-card ${passed ? 'passed' : 'failed'}`}>
            <div className="result-icon">
              {passed ? '' : ''}
            </div>
            <h2>ผลการทำแบบทดสอบ</h2>
            <div className="score-display">
              <div className="score-number">{score}/{questions.length}</div>
              <div className="score-percentage">{percentage.toFixed(0)}%</div>
            </div>
            <div className={`result-status ${passed ? 'pass' : 'fail'}`}>
              {passed ? 'ผ่าน ✓' : 'ไม่ผ่าน ✗'}
            </div>
            <p className="result-message">
              {passed 
                ? 'ยินดีด้วย! คุณผ่านแบบทดสอบ' 
                : 'คุณต้องได้คะแนนอย่างน้อย 60% เพื่อผ่านแบบทดสอบ'}
            </p>

            {previousScore && previousScore.score !== score && (
              <div className="previous-score-info">
                <p>📊 คะแนนครั้งก่อน: {previousScore.score}/{questions.length} ({previousScore.percentage.toFixed(0)}%)</p>
                {score > previousScore.score ? (
                  <p className="score-improved">🎉 คะแนนดีขึ้น +{score - previousScore.score} คะแนน!</p>
                ) : score < previousScore.score ? (
                  <p className="score-decreased">📉 คะแนนลดลง {previousScore.score - score} คะแนน</p>
                ) : null}
              </div>
            )}
            
            <div className="answer-review">
              <h3>เฉลยคำตอบ</h3>
              {questions.map((q, index) => {
                const isCorrect = answers[q.id] === q.correct;
                return (
                  <div key={q.id} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="review-header">
                      <span className="review-number">ข้อ {index + 1}</span>
                      <span className={`review-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓ ถูกต้อง' : '✗ ผิด'}
                      </span>
                    </div>
                    <p className="review-question">{q.question}</p>
                    <div className="review-answers">
                      <div className="your-answer">
                        <strong>คำตอบของคุณ:</strong> {q.options[answers[q.id]]}
                      </div>
                      {!isCorrect && (
                        <div className="correct-answer">
                          <strong>คำตอบที่ถูกต้อง:</strong> {q.options[q.correct]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleReset} className="btn-retry">
              ทำแบบทดสอบอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="posttest-container">
      <div className="posttest-header">
        <h1>แบบทดสอบหลังเรียน (Post-test)</h1>
        <p className="header-description">
          ข้อสอบเกี่ยวกับการสร้างเว็บไซต์ HTML, CSS, JavaScript และ Bootstrap
        </p>
        <div className="test-info">
          <span className="info-item">📝 จำนวน {questions.length} ข้อ</span>
          <span className="info-item">⏱️ ไม่จำกัดเวลา</span>
          <span className="info-item">✅ ผ่าน 60%</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="posttest-form">
        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <div className="question-header">
              <span className="question-number">ข้อที่ {index + 1}</span>
              <span className="required-mark">*</span>
            </div>
            <p className="question-text">{q.question}</p>
            <div className="options-container">
              {q.options.map((option, optionIndex) => (
                <label 
                  key={optionIndex} 
                  className={`option-label ${answers[q.id] === optionIndex ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={optionIndex}
                    checked={answers[q.id] === optionIndex}
                    onChange={() => handleAnswerChange(q.id, optionIndex)}
                    className="option-radio"
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="submit-section">
          <button type="submit" className="btn-submit">
            ส่งคำตอบ
          </button>
          <button type="button" onClick={handleReset} className="btn-clear">
            ล้างคำตอบ
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostTest;