import React, { useState } from "react";
import { HTMLHint } from "htmlhint";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-markup"; // for HTML
import "prismjs/themes/prism.css";

const defaultHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Live Preview</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>Edit the HTML to see changes here.</p>
  </body>
</html>`;

const htmlHintRules = {
  "tag-pair": true,
  "doctype-first": true,
  "tagname-lowercase": true,
  "attr-lowercase": true,
  "attr-value-double-quotes": true,
  "id-unique": true,
  "src-not-empty": true,
  "attr-no-duplication": true,
  "title-require": true,
};

function validateHtml(html) {
  const errors = HTMLHint.verify(html, htmlHintRules);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    const beforeBody = html.split(/<body[^>]*>/i)[0]
      .replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/<html[^>]*>/i, '')
      .replace(/<head>[\s\S]*?<\/head>/i, '')
      .trim();
    const afterBody = html.split(/<\/body>/i)[1]?.replace(/<\/html>/i, '').trim();
    if (beforeBody.length > 0) {
      errors.push({
        line: 1,
        col: 1,
        message: "ควรเขียนโค้ดเฉพาะใน <body> เท่านั้น (พบเนื้อหาก่อน <body>)",
        rule: { id: "no-content-outside-body" }
      });
    }
    if (afterBody && afterBody.length > 0) {
      const lines = html.split(/<\/body>/i)[0].split('\n').length + 1;
      errors.push({
        line: lines,
        col: 1,
        message: "ควรเขียนโค้ดเฉพาะใน <body> เท่านั้น (พบเนื้อหาหลัง </body>)",
        rule: { id: "no-content-outside-body" }
      });
    }
  } else {
    errors.push({
      line: 1,
      col: 1,
      message: "ไม่พบแท็ก <body> หรือ <body> ไม่ถูกต้อง",
      rule: { id: "body-required" }
    });
  }
  return errors;
}

// Blue theme colors
const blue = '#2196f3';
const blueDark = '#1565c0';
const blueLight = '#e3f2fd';
const blueGradient = 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)';
const blueShadow = '0 4px 24px 0 #2196f344';

const LiveHtmlEditor = () => {
  const [html, setHtml] = useState(defaultHtml);
  const [errors, setErrors] = useState([]);
  const [srcDoc, setSrcDoc] = useState(defaultHtml);
  const [ran, setRan] = useState(true);

  const handleRun = () => {
    const validationErrors = validateHtml(html);
    setErrors(validationErrors);
    setRan(true);
    const hasBodyError = validationErrors.some(e => ["no-content-outside-body", "body-required"].includes(e.rule.id));
    if (!hasBodyError && validationErrors.length === 0) {
      setSrcDoc(html);
    } else {
      setSrcDoc("");
    }
  };

  // Custom highlight: black text, < and > in blueDark
  const highlightWithCustom = code => {
    let html = Prism.highlight(code, Prism.languages.markup, 'markup');
    html = html.replace(/(&lt;|&gt;)/g, match =>
      `<span style=\"color: ${blueDark}; font-weight: bold; transition: color 0.2s;\">${match}</span>`
    );
    html = `<span style=\"color: #111;\">${html}</span>`;
    return html;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      gap: "2.5rem",
      maxWidth: 1200,
      margin: "40px auto",
      background: blueLight,
      borderRadius: 18,
      boxShadow: blueShadow,
      padding: 32,
      minHeight: 600,
      alignItems: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
      border: `2.5px solid ${blue}`,
      transition: 'box-shadow 0.3s',
      animation: 'fadeIn 1s',
    }}>
      {/* Editor Side */}
      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ color: blue, marginBottom: 0, letterSpacing: 1, fontWeight: 800, fontSize: 28, textShadow: `0 2px 8px #2196f355` }}>Live HTML Editor</h2>
        <Editor
          value={html}
          onValueChange={code => { setHtml(code); setRan(false); }}
          highlight={highlightWithCustom}
          padding={14}
          textareaId="codeArea"
          style={{
            fontFamily: "Fira Mono, monospace",
            fontSize: 16,
            width: "100%",
            minHeight: 380,
            border: `2px solid ${blue}`,
            borderRadius: 10,
            background: '#fff',
            color: "#111",
            outline: 'none',
            boxSizing: 'border-box',
            boxShadow: `0 2px 12px 0 #2196f322`,
            transition: 'border 0.2s, box-shadow 0.2s',
            caretColor: blue,
            lineHeight: 1.6,
          }}
        />
        <button
          onClick={handleRun}
          style={{
            background: blueGradient,
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '12px 40px',
            fontSize: 20,
            fontWeight: 700,
            cursor: 'pointer',
            alignSelf: 'flex-start',
            boxShadow: `0 2px 12px 0 #2196f322`,
            transition: 'background 0.2s, transform 0.1s',
            marginTop: 8,
            letterSpacing: 1,
            textShadow: '0 1px 4px #2196f355',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>Run</span>
          <span style={{
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'radial-gradient(circle at 60% 40%, #21cbf3 0%, transparent 70%)',
            opacity: 0.18,
            zIndex: 1,
            pointerEvents: 'none',
            borderRadius: 10,
          }} />
        </button>
        <div style={{ minHeight: 60, marginTop: 8 }}>
          {ran && (errors.length === 0 ? (
            <div style={{ color: blueDark, background: '#fff', border: `1.5px solid ${blue}`, borderRadius: 8, padding: 10, fontWeight: 600, boxShadow: '0 1px 8px #2196f322', transition: 'border 0.2s' }}>HTML is valid!</div>
          ) : ran && (
            <div style={{ color: blueDark, background: '#fff', border: `1.5px solid ${blue}`, borderRadius: 8, padding: 10, boxShadow: '0 1px 8px #2196f322', transition: 'border 0.2s' }}>
              <b style={{ color: blueDark }}>HTML Errors/Warnings:</b>
              <ul style={{ margin: 0, paddingLeft: 22 }}>
                {errors.map((err, idx) => (
                  <li key={idx} style={{ color: '#c0392b', marginBottom: 2, fontWeight: 500 }}>
                    Line {err.line}, Col {err.col}: {err.message} <br />
                    <span style={{ fontSize: 12, color: blue }}>Rule: {err.rule.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* Preview Side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', minWidth: 0 }}>
        <h3 style={{ color: blue, marginBottom: 8, fontWeight: 800, fontSize: 24, letterSpacing: 1, textShadow: `0 2px 8px #2196f355` }}>Preview</h3>
        <div style={{
          flex: 1,
          minHeight: 420,
          background: '#fff',
          border: `2px solid ${blue}`,
          borderRadius: 12,
          boxShadow: '0 2px 16px 0 #2196f322',
          overflow: 'auto',
          position: 'relative',
          transition: 'box-shadow 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'slideIn 0.8s',
        }}>
          {ran && srcDoc ? (
            <iframe
              title="Live Preview"
              srcDoc={srcDoc}
              sandbox="allow-same-origin"
              style={{ width: "100%", minHeight: 400, border: 'none', borderRadius: 12, background: "#fff", transition: 'box-shadow 0.2s' }}
            />
          ) : ran && (
            <div style={{ color: blueDark, fontStyle: 'italic', background: '#fff', border: `1.5px solid ${blue}`, borderRadius: 8, padding: 24, fontWeight: 600, boxShadow: '0 1px 8px #2196f322' }}>Preview not available due to HTML structure errors.</div>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default LiveHtmlEditor;
