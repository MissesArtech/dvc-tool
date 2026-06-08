import { useState } from 'react';

const B = { black:'#0A0A0A', white:'#FFFFFF', orange:'#FF5C00', grey:'#1A1A1A', greyMid:'#2A2A2A', greyLight:'#999999', offwhite:'#F0F0F0' };
const mono = "'Montserrat', sans-serif";
const sans = "'Bebas Neue', 'Arial Black', sans-serif";
const gs = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}body{background:#0A0A0A;}input:focus{outline:none;border-color:#FF5C00!important;}::placeholder{color:#555;}`;

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/dashboard', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ password }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const formatDate = (str) => new Date(str).toLocaleDateString('en-NZ', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', timeZone:'Pacific/Auckland' });

  const aggregated = data ? Object.values(data.reduce((acc, row) => {
    const key = `${row.student_name}||${row.class_code}`;
    if (!acc[key]) acc[key] = { ...row, count: 0 };
    acc[key].count++;
    if (new Date(row.created_at) > new Date(acc[key].created_at)) acc[key].created_at = row.created_at;
    return acc;
  }, {})) : [];

  const Logo = () => (
    <div style={{ display:'flex', alignItems:'center' }}>
      <div style={{ width:48, height:48, background:'#FF5C00', display:'flex', alignItems:'center', justifyContent:'center', marginRight:16, flexShrink:0 }}>
        <div style={{ width:24, height:24, borderRadius:'50%', background:B.black }} />
      </div>
      <div>
        <div style={{ fontFamily:sans, fontSize:22, color:B.white, letterSpacing:'0.12em', lineHeight:1 }}>DVC WITH KIM</div>
        <div style={{ fontFamily:mono, fontSize:9, color:'#FF5C00', letterSpacing:'0.2em', textTransform:'uppercase', marginTop:2 }}>Teacher Dashboard</div>
      </div>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight:'100vh', background:B.black }}>
      <style>{gs}</style>
      <header style={{ background:B.black, borderBottom:'4px solid #FF5C00', padding:'0 24px', height:64, display:'flex', alignItems:'center' }}>
        <Logo />
      </header>
      <div style={{ maxWidth:480, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ fontFamily:sans, fontSize:'clamp(52px,10vw,80px)', color:B.white, lineHeight:0.9, letterSpacing:'0.04em' }}>TEACHER</div>
        <div style={{ fontFamily:sans, fontSize:'clamp(52px,10vw,80px)', color:'#FF5C00', lineHeight:0.9, letterSpacing:'0.04em', marginBottom:32 }}>LOGIN</div>
        <label style={{ fontFamily:mono, fontSize:10, color:'#FF5C00', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8, display:'block' }}>Teacher Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==='Enter' && login()} placeholder="Enter password"
          style={{ background:B.grey, border:'2px solid #2A2A2A', color:B.white, fontFamily:mono, fontSize:14, padding:'14px 16px', width:'100%', marginBottom:16 }} />
        {error && <div style={{ background:B.greyMid, borderLeft:'4px solid #FF5C00', padding:'12px 16px', fontFamily:mono, fontSize:11, color:'#FF5C00', marginBottom:16 }}>⚠ {error}</div>}
        <button onClick={login} disabled={loading}
          style={{ width:'100%', padding:'18px', background:loading ? B.greyMid : '#FF5C00', color:loading ? B.greyLight : B.black, border:'none', fontFamily:sans, fontSize:24, letterSpacing:'0.12em', cursor:loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'LOADING...' : 'VIEW DASHBOARD →'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:B.black }}>
      <style>{gs}</style>
      <header style={{ background:B.black, borderBottom:'4px solid #FF5C00', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Logo />
        <button onClick={() => { setData(null); setPassword(''); }}
          style={{ background:'transparent', color:B.greyLight, border:'1px solid #444', fontFamily:mono, fontSize:9, padding:'4px 12px', cursor:'pointer', letterSpacing:'0.15em', textTransform:'uppercase' }}>
          Log Out
        </button>
      </header>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ fontFamily:sans, fontSize:48, color:B.white, letterSpacing:'0.04em', lineHeight:1 }}>USAGE</div>
        <div style={{ fontFamily:sans, fontSize:48, color:'#FF5C00', letterSpacing:'0.04em', lineHeight:1, marginBottom:8 }}>DASHBOARD</div>
        <div style={{ fontFamily:mono, fontSize:11, color:B.greyLight, marginBottom:32 }}>{data.length} total generations</div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:3, marginBottom:32 }}>
          {['1TECD','2TECD','3TECD'].map(cls => (
            <div key={cls} style={{ background:B.grey, padding:'20px' }}>
              <div style={{ fontFamily:mono, fontSize:9, color:B.greyLight, letterSpacing:'0.2em', marginBottom:8 }}>{cls}</div>
              <div style={{ fontFamily:sans, fontSize:48, color:B.white, lineHeight:1 }}>{data.filter(r => r.class_code===cls).length}</div>
              <div style={{ fontFamily:mono, fontSize:9, color:B.greyLight, marginTop:4 }}>generations</div>
            </div>
          ))}
          <div style={{ background:'#FF5C00', padding:'20px' }}>
            <div style={{ fontFamily:mono, fontSize:9, color:B.black, letterSpacing:'0.2em', marginBottom:8, opacity:0.7 }}>TOTAL</div>
            <div style={{ fontFamily:sans, fontSize:48, color:B.black, lineHeight:1 }}>{data.length}</div>
            <div style={{ fontFamily:mono, fontSize:9, color:B.black, marginTop:4, opacity:0.7 }}>all classes</div>
          </div>
        </div>

        <div style={{ background:B.grey }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr', background:B.black, padding:'10px 16px' }}>
            {['Student','Class','Tool','Uses','Last Active'].map(h => (
              <div key={h} style={{ fontFamily:mono, fontSize:9, color:'#FF5C00', letterSpacing:'0.15em', textTransform:'uppercase' }}>{h}</div>
            ))}
          </div>
          {aggregated.map(({ student_name, class_code, tool, count, created_at }, i) => (
            <div key={`${student_name}-${class_code}`} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr', padding:'12px 16px', background: i%2===0 ? B.grey : B.greyMid, borderTop:'1px solid #2A2A2A' }}>
              <div style={{ fontFamily:mono, fontSize:12, color:B.white, fontWeight:700 }}>{student_name}</div>
              <div style={{ fontFamily:mono, fontSize:12, color:B.offwhite }}>{class_code}</div>
              <div style={{ fontFamily:mono, fontSize:12, color:B.offwhite }}>{tool}</div>
              <div><span style={{ background:count>3 ? '#FF5C00' : B.greyMid, color:count>3 ? B.black : B.offwhite, fontFamily:mono, fontSize:11, fontWeight:700, padding:'2px 10px', display:'inline-block' }}>{count}</span></div>
              <div style={{ fontFamily:mono, fontSize:11, color:B.greyLight }}>{formatDate(created_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
