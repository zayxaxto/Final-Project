const fs = require('fs');
const path = require('path');

const files = ['begin.jsx', 'inter.jsx', 'advan.jsx', 'bootstrap.jsx'];

for (const file of files) {
  const filePath = path.join(__dirname, 'src', 'components', file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // We want to rewrite handleProgress completely for preventing seek forward.
  // We'll find the handleProgress block.

  const progressRegex = /const handleProgress = \(state\) => \{[\s\S]*?quizData\.forEach\(quiz => \{/g;
  
  const replacement = `const handleProgress = (state) => {
    const playedSeconds = state.playedSeconds;

    // ป้องกันการกรอวิดีโอไปข้างหน้า (ถ้าข้ามไปเกิน 2 วินาที)
    if (playedSeconds > maxWatchedTime + 2) {
      if (playerRef.current) {
        playerRef.current.seekTo(maxWatchedTime, 'seconds');
      }
      return;
    }

    // อัพเดทเวลาสูงสุดที่ดูแล้ว
    if (playedSeconds > maxWatchedTime) {
      setMaxWatchedTime(playedSeconds);
    }

    setCurrentTime(Math.floor(playedSeconds));

    quizData.forEach(quiz => {`;

  let newContent = content.replace(progressRegex, replacement);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Failed to update ${file}`);
  }
}
