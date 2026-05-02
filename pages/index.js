import { useState, useRef } from 'react';

const CLASSES = ['1TECD', '2TECD', '3TECD'];

export default function Home() {
  const [screen, setScreen] = useState('login');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [tool, setTool] = useState('fusion');
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [script, setScript] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleLogin = () => {
    if (!CLASSES.includes(password.toUpperCase())) {
      setError('Invalid class password. Try 1TECD, 2TECD or 3TECD.');
      return;
    }
    if (!studentName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setPassword(password.toUpperCase());
    setError(null);
    setScreen('tool');
  };

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({ dataUrl: e.target.result, base64: e.target.result.split(',')[1], mediaType: file.type });
      setResult(null);
      setScript(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setScript(null);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image.base64,
          mediaType: image.mediaType,
          prompt,
          password,
          studentName,
          tool,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.result);
      setScript(data.script || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadScript = () => {
    if (!script) return;
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, '_')}_fusion360.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseResult = (text) => {
    const headers = tool === 'fusion'
      ? ['DESIGN ANALYSIS', 'KEY COMPONENTS', 'FUSION 360 STEPS', 'DESIGN TIPS']
      : ['DESIGN ANALYSIS', 'KEY ELEMENTS', 'SKETCHUP STEPS', 'DESIGN TIPS'];
    const sections = [];
    for (let i = 0; i < headers.length; i++) {
      const start = text.indexOf(headers[i]);
      if (start === -1) continue;
      const contentStart = start + headers[i].length;
      const end = i + 1 < headers.length ? text.indexOf(headers[i + 1], contentStart) : text.length;
      sections.push({ header: headers[i], content: text.slice(contentStart, end === -1 ? text.length : end).trim() });
    }
    return sections.length > 0 ? sections : [{ header: 'RESULT', content: text.trim() }];
  };

  const icons = {
    'DESIGN ANALYSIS': '👁',
    'KEY COMPONENTS': '🔩',
    'KEY ELEMENTS': '🏛',
    'FUSION 360 STEPS': '🔧',
    'SKETCHUP STEPS': '📐',
    'DESIGN TIPS': '💡',
    'RESULT': '📄',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#1a1a1a', borderBottom: '4px solid #c04a1a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, background: '#c04a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>DVC</div>
          <div>
            <div style={{ color: '#f5f0e8', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {tool === 'fusion' ? 'Drawing → Fusion 360' : 'Drawing → SketchUp'}
            </div>
            <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Albany Senior High School</div>
          </div>
        </div>
        {screen === 'tool' && (
          <div style={{ color: '#aaa', fontFamily: 'monospace', fontSize: 11 }}>
            {studentName} · {password}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '36px 20px' }}>

        {screen === 'login' && (
          <div>
            <div style={{ borderLeft: '4px solid #c04a1a', paddingLeft: 18, marginBottom: 36 }}>
              <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: 1, marginBottom: 10 }}>
                Sketch to<br />3D Model
              </h1>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#555', lineHeight: 1.8 }}>
                Upload your hand-drawn design and get personalised step-by-step instructions for Fusion 360 or SketchUp.
              </p>
            </div>

            <div style={{ background: 'white', border: '2px solid #1a1a1a', padding: '28px 32px' }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 8 }}>Your Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="First and last name"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, border: '2px solid #1a1a1a', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 8 }}>Class Password</label>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your class code"
                  style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, border: '2px solid #1a1a1a', padding: '10px 14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 8 }}>Select Tool</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['fusion', '🔧 Fusion 360', 'Product & industrial design'], ['sketchup', '📐 SketchUp', 'Architecture & spatial design']].map(([val, label, sub]) => (
                    <div key={val} onClick={() => setTool(val)} style={{ border: `2px solid ${tool === val ? '#c04a1a' : '#ddd'}`, background: tool === val ? '#fff0ed' : 'white', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#888' }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div style={{ background: '#fff0ed
