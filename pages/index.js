import { useState, useRef } from 'react';

const CLASSES = ['1TECD', '2TECD', '3TECD'];

const B = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  orange: '#FF5C00',
  grey: '#1A1A1A',
  greyMid: '#2A2A2A',
  greyLight: '#999999',
  offwhite: '#F0F0F0',
};

const mono = "'Montserrat', sans-serif";
const sans = "'Bebas Neue', 'Arial Black', sans-serif";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  ::placeholder { color: #ffffff; }
  textarea:focus, input:focus { outline: none; border-color: #FF5C00 !important; }
`;

export default function Home() {
  const [screen, setScreen] = useState('login');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [tool, setTool] = useState('onshape');
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const outputRef = useRef();

  const handleLogin = () => {
    if (!CLASSES.includes(password.toUpperCase())) {
      setError('Invalid class code. Ask your teacher for the correct code.');
      return;
    }
    if (!studentName.trim()) {
      setError('Enter your name to continue.');
      return;
    }
    setPassword(password.toUpperCase());
    setError(null);
    setScreen('tool');
  };

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large (over 5MB). Use a photo of your hand-drawn sketch taken on your phone — these work best.');
      return;
    }
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
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const parseResult = (text) => {
    const headers = tool === 'sketchup'
      ? ['DESIGN ANALYSIS', 'KEY ELEMENTS', 'SKETCHUP STEPS', 'DESIGN TIPS']
      : ['DESIGN ANALYSIS', 'KEY COMPONENTS', 'ONSHAPE STEPS', 'DESIGN TIPS'];
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

  const Header = () => (
    <header style={{
      background: B.black,
      borderBottom: '4px solid #FF5C00',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <div style={{
          width: 48, height: 48,
          background: '#FF5C00',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 16,
          flexShrink: 0,
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: B.black }} />
        </div>
        <div>
          <div style={{ fontFamily: sans, fontSize: 22, color: B.white, letterSpacing: '0.12em', lineHeight: 1 }}>DVC WITH KIM</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: '#FF5C00', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>
            {screen === 'tool' ? `${studentName} · ${password}` : 'Sketch to 3D'}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: mono, fontSize: 9, color: B.greyLight, letterSpacing: '0.15em', textTransform: 'uppercase', border: '1px solid #444444', padding: '4px 10px' }}>AI TOOL</div>
    </header>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div style={{ background: B.greyMid, borderLeft: '4px solid #FF5C00', padding: '12px 16px', fontFamily: mono, fontSize: 11, color: '#FF5C00', marginBottom: 20 }}>⚠ {msg}</div>
  ) : null;

  if (screen === 'login') return (
    <div style={{ minHeight: '100vh', background: B.black }}>
      <style>{globalStyles}</style>
      <Header />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: sans, fontSize: 'clamp(64px, 12vw, 100px)', color: B.white, lineHeight: 0.9, letterSpacing: '0.04em' }}>SKETCH</div>
          <div style={{ fontFamily: sans, fontSize: 'clamp(64px, 12vw, 100px)', color: '#FF5C00', lineHeight: 0.9, letterSpacing: '0.04em' }}>TO 3D</div>
          <div style={{ fontFamily: mono, fontSize: 12, color: B.greyLight, marginTop: 20, letterSpacing: '0.02em', lineHeight: 1.7 }}>
            Upload your hand-drawn design sketch.<br />
            Get personalised step-by-step modelling instructions.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <label style={{ fontFamily: mono, fontSize: 10, color: '#FF5C00', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Your Name</label>
          <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="First and last name"
            style={{ background: B.grey, border: '2px solid #2A2A2A', color: B.white, fontFamily: mono, fontSize: 14, padding: '14px 16px', marginBottom: 24, width: '100%' }} />

          <label style={{ fontFamily: mono, fontSize: 10, color: '#FF5C00', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>Class Code</label>
          <input type="text" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your class code"
            style={{ background: B.grey, border: '2px solid #2A2A2A', color: B.white, fontFamily: mono, fontSize: 14, padding: '14px 16px', marginBottom: 24, width: '100%' }} />

          <label style={{ fontFamily: mono, fontSize: 10, color: '#FF5C00', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Select Tool</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 32 }}>
            {[['onshape', 'ONSHAPE', 'Product & industrial design'], ['sketchup', 'SKETCHUP', 'Architecture & spatial design']].map(([val, label, sub]) => (
              <div key={val} onClick={() => setTool(val)} style={{ background: tool === val ? '#FF5C00' : B.grey, padding: '16px', cursor: 'pointer', transition: 'background 0.15s' }}>
                <div style={{ fontFamily: sans, fontSize: 20, color: tool === val ? B.black : B.white, letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: tool === val ? B.black : B.greyLight }}>{sub}</div>
              </div>
            ))}
          </div>

          <ErrorBox msg={error} />

          <button onClick={handleLogin}
            style={{ background: B.white, color: B.black, border: 'none', fontFamily: sans, fontSize: 24, letterSpacing: '0.12em', padding: '18px', cursor: 'pointer', width: '100%', transition: 'background 0.15s' }}
            onMouseEnter={e => e.target.style.background = '#FF5C00'}
            onMouseLeave={e => e.target.style.background = B.white}>
            ENTER →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: B.black }}>
      <style>{globalStyles}</style>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, marginBottom: 40 }}>
          {[['onshape', 'ONSHAPE'], ['sketchup', 'SKETCHUP']].map(([val, label]) => (
            <div key={val} onClick={() => { setTool(val); setResult(null); setError(null); }}
              style={{ background: tool === val ? '#FF5C00' : B.grey, padding: '12px 16px', cursor: 'pointer', fontFamily: sans, fontSize: 20, letterSpacing: '0.1em', color: tool === val ? B.black : B.greyLight, textAlign: 'center', transition: 'all 0.15s' }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#FF5C00', color: B.black, fontFamily: sans, fontSize: 14, letterSpacing: '0.1em', padding: '4px 10px' }}>01</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: B.greyLight, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Upload Your Drawing</div>
          </div>
          {!image ? (
            <div onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); loadFile(e.dataTransfer.files[0]); }}
              style={{ border: `2px dashed ${dragOver ? '#FF5C00' : '#2A2A2A'}`, background: dragOver ? B.grey : 'transparent', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 20, height: 2, background: B.greyLight }} />
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: B.greyLight, textAlign: 'center' }}>
                <span style={{ display: 'block', color: B.white, marginBottom: 4, fontSize: 13 }}>Drop your drawing here</span>
                or tap to browse — JPG, PNG, HEIC · max 5MB
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => loadFile(e.target.files[0])} />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img src={image.dataUrl} alt="Drawing" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: B.grey, display: 'block' }} />
              <button onClick={() => setImage(null)}
                style={{ position: 'absolute', top: 0, right: 0, background: '#FF5C00', color: B.black, border: 'none', fontFamily: mono, fontSize: 10, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.1em' }}>
                ✕ REMOVE
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#FF5C00', color: B.black, fontFamily: sans, fontSize: 14, letterSpacing: '0.1em', padding: '4px 10px' }}>02</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: B.greyLight, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Describe Your Design</div>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            placeholder={tool === 'sketchup' ? 'e.g. Two storey house, open plan ground floor, large north-facing windows, corrugated iron roof...' : 'e.g. Manual pour-over coffee maker, glass cone body, wooden ring stand, stainless steel filter, carafe below...'}
            style={{ width: '100%', minHeight: 100, background: B.grey, border: '2px solid #2A2A2A', color: B.white, fontFamily: mono, fontSize: 12, padding: '14px 16px', resize: 'vertical', lineHeight: 1.7 }} />
        </div>

        <ErrorBox msg={error} />

        <button onClick={generate} disabled={!image || loading}
          style={{ width: '100%', padding: '20px', background: !image || loading ? B.greyMid : '#FF5C00', color: !image || loading ? B.greyLight : B.black, border: 'none', fontFamily: sans, fontSize: 28, letterSpacing: '0.12em', cursor: !image || loading ? 'not-allowed' : 'pointer', marginBottom: 40, transition: 'all 0.15s' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <span style={{ width: 20, height: 20, border: '3px solid #444', borderTopColor: '#FF5C00', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              ANALYSING
            </span>
          ) : 'ANALYSE + GENERATE →'}
        </button>

        {result && (
          <div ref={outputRef} style={{ animation: 'fadeUp 0.4s ease' }}>
            {parseResult(result).map(({ header, content }, i) => (
              <div key={header}>
                <div style={{ background: i === 0 ? '#FF5C00' : B.greyMid, padding: '10px 16px', fontFamily: sans, fontSize: 16, letterSpacing: '0.1em', color: i === 0 ? B.black : B.white, marginTop: i === 0 ? 0 : 3 }}>
                  {header}
                </div>
                <div style={{ background: B.grey, padding: '20px', fontFamily: mono, fontSize: 12, lineHeight: 1.9, color: B.offwhite, whiteSpace: 'pre-wrap' }}>
                  {content}
                </div>
              </div>
            ))}
            <button onClick={() => navigator.clipboard.writeText(result)}
              style={{ background: B.greyMid, color: B.white, border: 'none', fontFamily: mono, fontSize: 10, padding: '10px 20px', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3, width: '100%' }}>
              COPY ALL INSTRUCTIONS
            </button>
          </div>
        )}

        {!result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, marginTop: 24 }}>
            {[
              ['SKETCHES', 'Front + side views. Label your parts. Note key dimensions.'],
              ['PROMPTS', 'Be specific. Name materials, mechanisms, and key features.'],
              ['MODELLING', 'Work part by part. Biggest shapes first, details after.'],
            ].map(([title, text]) => (
              <div key={title} style={{ background: B.grey, padding: '16px' }}>
                <div style={{ fontFamily: sans, fontSize: 14, color: '#FF5C00', letterSpacing: '0.1em', marginBottom: 8 }}>{title}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: B.greyLight, lineHeight: 1.7 }}>{text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  
