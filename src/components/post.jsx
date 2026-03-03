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
      question: "ภาษา HTML จัดเป็นภาษาประเภทใด",
      options: [
        "Markup Language",
        "Style Sheet Language",
        "Programming Language",
        "Scripting Language"
      ],
      correct: 0
    },
    {
      id: 2,
      question: "ข้อใดคือคุณลักษณะใหม่ใน HTML5 ที่ช่วยให้กำหนดโครงสร้างเนื้อหาได้อย่างมีความหมาย",
      options: [
        "การใช้แท็ก <div> แทนแท็กโครงสร้างทั้งหมด",
        "การเพิ่มแท็กมัลติมีเดีย เช่น <audio> และ <video>",
        "การเพิ่มแท็กโครงสร้างที่มีความหมาย",
        "การบังคับใช้กฎการปิดแท็กแบบ XHTML"
      ],
      correct: 2
    },
    {
      id: 3,
      question: "ส่วนของเอกสาร HTML ที่ใช้สำหรับกำหนดชื่อเพจที่จะปรากฏบนแท็บเบราว์เซอร์ ควรถูกกำหนดไว้ในแท็กใด",
      options: [
        "<title>",
        "<body>",
        "<meta>",
        "<head>"
      ],
      correct: 0
    },
    {
      id: 4,
      question: "หากต้องการกำหนดให้ข้อความเป็นหัวข้อหลักที่สำคัญที่สุด ควรใช้แท็กใด",
      options: [
        "<title>",
        "<h2>",
        "<h1>",
        "<p>"
      ],
      correct: 2
    },
    {
      id: 5,
      question: "แอตทริบิวต์ใดในแท็ก <img> ที่จำเป็นที่สุดสำหรับการแสดงรูปภาพบนเว็บเพจ โดยทำหน้าที่ระบุตำแหน่ง",
      options: [
        "id",
        "src",
        "alt",
        "title"
      ],
      correct: 1
    },
    {
      id: 6,
      question: "ข้อใดกล่าวถึงหน้าที่หลักของ CSS ได้ถูกต้องที่สุด",
      options: [
        "ใช้เขียนโครงสร้างเว็บไซต์",
        "ใช้จัดการฐานข้อมูลเว็บไซต์",
        "ใช้ประมวลผลฝั่งเซิร์ฟเวอร์",
        "ใช้กำหนดรูปแบบและความสวยงามของเว็บไซต์"
      ],
      correct: 3
    },
    {
      id: 7,
      question: "CSS ย่อมาจากข้อใด",
      options: [
        "Cascading Style Sheet ",
        "Computer Style Sheet ",
        "Creative Style Sheet ",
        "Control Style Sheet "
      ],
      correct: 0
    },
    {
      id: 8,
      question: "คุณสมบัติใดใช้จัดตำแหน่งข้อความให้อยู่กึ่งกลาง",
      options: [
        "text-style",
        "font-align: center",
        "align-text: center ",
        "text-align: center"
      ],
      correct: 3
    },
    {
      id: 9,
      question: "คุณสมบัติใดใช้กำหนดสีพื้นหลัง",
      options: [
        "color",
        "bg-color",
        "background-image",
        "background-color"
      ],
      correct: 3
    },
    {
      id: 10,
      question: "แอตทริบิวต์ใดใช้ระบุไฟล์ CSS",
      options: [
        "href",
        "src",
        "class",
        "Id"
      ],
      correct: 0
    },
    {
      id: 11,
      question: "ข้อใดอธิบายหน้าที่หลักของ JavaScript ได้ถูกต้องที่สุด",
      options: [
        "ใช้รับคำสั่งและโต้ตอบกับผู้ใช้",
        "ใช้กำหนดโครงสร้างหน้าเว็บ",
        "ใช้ตกแต่งสีและรูปแบบหน้าเว็บ",
        "ใช้จัดเก็บข้อมูลถาวรบนเซิร์ฟเวอร์"
      ],
      correct: 0
    },
    {
      id: 12,
      question: "ข้อใดกล่าวถูกต้องเกี่ยวกับการเขียนคำสั่ง JavaScript",
      options: [
        "ต้องเขียนคำสั่ง JavaScript แยกเป็นไฟล์ .js เท่านั้น",
        "ต้องเขียนคำสั่ง JavaScript ภายใต้แท็ก <script> ... </script>",
        "ต้องเขียนคำสั่ง JavaScript ไว้นอกเอกสาร HTML ",
        "สามารถเขียนคำสั่ง JavaScript แทนที่แท็ก"
      ],
      correct: 1
    },
    {
      id: 13,
      question: "คำสั่ง document.write() มีหน้าที่ใด",
      options: [
        "บันทึกข้อมูลลงฐานข้อมูล",
        "แสดงข้อความแจ้งเตือน",
        "แสดงผลข้อความลงบนหน้าเว็บ",
        "ตรวจสอบข้อผิดพลาดของโปรแกรม"
      ],
      correct: 2
    },
    {
      id: 14,
      question: "ข้อใดเป็นรูปแบบคำสั่งที่ถูกต้องในการแสดงผลข้อมูลด้วย console.log",
      options: [
        "log.console(true);",
        "console = log(false);",
        "console(false).log;",
        "console.log(true);"
      ],
      correct: 3
    },
    {
      id: 15,
      question: "ข้อใดเป็นรูปแบบการประกาศตัวแปรด้วย const ที่ถูกต้อง",
      options: [
        "const = y 20;",
        "const y;",
        "const y = 20;",
        "y const = 20;"
      ],
      correct: 2
    },
    {
      id: 16,
      question: "Bootstrap คืออะไร",
      options: [
        "ภาษาเขียนโปรแกรม",
        "โปรแกรมออกแบบกราฟิก",
        "Framework สำหรับพัฒนาเว็บไซต์",
        "ระบบจัดการฐานข้อมูล"
      ],
      correct: 2
    },
    {
      id: 17,
      question: "Bootstrap รองรับการแสดงผลหลายอุปกรณ์ด้วยแนวคิดใด",
      options: [
        "Static Web",
        "Responsive Web Design",
        "Fixed Layout",
        "Inline Design"
      ],
      correct: 1
    },
    {
      id: 18,
      question: "Grid System ของ Bootstrap แบ่งเป็นกี่คอลัมน์",
      options: [
        "8 คอลัมน์",
        "16 คอลัมน์",
        "10 คอลัมน์",
        "12 คอลัมน์"
      ],
      correct: 3
    },
    {
      id: 19,
      question: "คลาสใดแสดงข้อความสีเขียว",
      options: [
        "text-success",
        "text-warning",
        "text-danger",
        "text-info"
      ],
      correct: 0
    },
    {
      id: 20,
      question: "container-fluid มีลักษณะอย่างไร",
      options: [
        "กว้างเต็มหน้าจอ",
        "กว้างคงที่",
        "ใช้เฉพาะมือถือ",
        "ใช้กับ Card เท่านั้น"
      ],
      correct: 0
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