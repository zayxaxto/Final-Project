const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const regex = /<div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>[\s\S]*?<\/button>\s*<\/div>/g;

const newButtons = `<div className="stage-action-buttons">
              <button className="stage-btn stage-btn-primary" onClick={resetGame}>
                ↻ {isPassed ? 'Play Again' : 'Try Again'}
              </button>
              <button className="stage-btn stage-btn-secondary" onClick={() => navigate('/')}>
                🏠 Return to Stages
              </button>
            </div>`;

for (let i = 1; i <= 12; i++) {
  const filePath = path.join(componentsDir, `stage${i}.jsx`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping stage${i}.jsx (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let match = content.match(regex);
  if (!match) {
    // try alternative regex if flexWrap is not 'wrap'
    const altRegex = /<div style={{[^}]*display:\s*'flex'[^}]*}}>\s*<button[\s\S]*?<\/button>\s*<\/div>/g;
    match = content.match(altRegex);
    if (match) {
      content = content.replace(altRegex, newButtons);
      fs.writeFileSync(filePath, content);
      console.log(`Updated stage${i}.jsx (alt)`);
    } else {
      console.log(`No match in stage${i}.jsx`);
    }
  } else {
    content = content.replace(regex, newButtons);
    fs.writeFileSync(filePath, content);
    console.log(`Updated stage${i}.jsx`);
  }
}
