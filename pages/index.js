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
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
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

        {/* LOGIN SCREEN */}
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

              {error && <div style={{ background: '#fff0ed', border: '2px solid #c04a1a', padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#c04a1a', marginBottom: 16 }}>{error}</div>}

              <button onClick={handleLogin} style={{ width: '100%', padding: 14, background: '#c04a1a', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
                Enter →
              </button>
            </div>
          </div>
        )}

        {/* TOOL SCREEN */}
        {screen === 'tool' && (
          <div>
            {/* Tool switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
              {[['fusion', '🔧 Fusion 360'], ['sketchup', '📐 SketchUp']].map(([val, label]) => (
                <div key={val} onClick={() => { setTool(val); setResult(null); setError(null); }} style={{ border: `2px solid ${tool === val ? '#c04a1a' : '#ddd'}`, background: tool === val ? '#fff0ed' : 'white', padding: '10px 14px', cursor: 'pointer', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Upload */}
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c04a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              Step 01 — Upload Your Drawing
              <div style={{ flex: 1, height: 1, background: '#e8e2d8' }} />
            </div>

            {!image ? (
              <div onClick={() => fileRef.current.click()} style={{ border: '2px dashed #bbb', background: 'white', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
                <div style={{ fontSize: 32 }}>✏️</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#666', textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: 13, color: '#1a1a1a', marginBottom: 4 }}>Drop your drawing here</strong>
                  or click to browse
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
              </div>
            ) : (
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <img src={image.dataUrl} alt="Drawing" style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: 'white', border: '2px solid #1a1a1a', display: 'block' }} />
                <button onClick={() => setImage(null)} style={{ position: 'absolute', top: 0, right: 0, background: '#c04a1a', color: 'white', border: 'none', fontFamily: 'monospace', fontSize: 10, padding: '4px 12px', cursor: 'pointer', textTransform: 'uppercase' }}>✕ Remove</button>
              </div>
            )}

            {/* Prompt */}
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c04a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              Step 02 — Describe Your Design
              <div style={{ flex: 1, height: 1, background: '#e8e2d8' }} />
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={tool === 'fusion' ? 'e.g. Manual drip coffee maker with glass decanter, wooden base and metal legs...' : 'e.g. Two storey house with open plan ground floor, large windows facing north...'}
              style={{ width: '100%', minHeight: 80, fontFamily: 'monospace', fontSize: 12, border: '2px solid #1a1a1a', padding: '12px 14px', resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box', marginBottom: 16 }}
            />

            {error && <div style={{ background: '#fff0ed', border: '2px solid #c04a1a', padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#c04a1a', marginBottom: 16 }}>{error}</div>}

            <button onClick={generate} disabled={!image || loading} style={{ width: '100%', padding: 16, background: !image || loading ? '#ccc' : '#c04a1a', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: !image || loading ? 'not-allowed' : 'pointer', marginBottom: 32 }}>
              {loading ? 'Analysing...' : 'Analyse & Generate →'}
            </button>

            {/* Result */}
            {result && (
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c04a1a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  Your Instructions
                  <div style={{ flex: 1, height: 1, background: '#e8e2d8' }} />
                </div>
                <div style={{ background: 'white', border: '2px solid #1a1a1a', padding: '24px 28px' }}>
                  {parseResult(result).map(({ header, content }) => (
                    <div key={header} style={{ marginBottom: 24 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d5a73', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #e8e2d8' }}>
                        {icons[header] || '—'} {header}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9, color: '#1a1a1a', whiteSpace: 'pre-wrap' }}>
                        {content}
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigator.clipboard.writeText(result)} style={{ background: '#3d5a73', color: 'white', border: 'none', fontFamily: 'monospace', fontSize: 10, padding: '6px 16px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Copy All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
