const fs = require('fs');
const path = require('path');

for (let i = 1; i <= 12; i++) {
    const filePath = path.join(__dirname, 'src', 'components', `stage${i}.jsx`);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    // add className "stage-final-score-text" to the div with fontSize: '2em'
    content = content.replace(/<div style={{ fontSize: '2em',\s*marginBottom: '15px' }}>/g, '<div className="stage-final-score-text" style={{ fontSize: "2em", marginBottom: "15px" }}>');

    // add className "stage-correct-review-text" to the div with color: '#555'
    content = content.replace(/<div style={{ fontSize: '1.3em',\s*color: '#555',\s*marginBottom: '25px',\s*padding: '15px',\s*background: '#f5f5f5',\s*borderRadius: '10px' }}>/g, '<div className="stage-correct-review-text" style={{ fontSize: "1.3em", marginBottom: "25px", padding: "15px", borderRadius: "10px" }}>');

    fs.writeFileSync(filePath, content);
}
console.log("Updated classes in stages");
