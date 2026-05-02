import { useState } from 'react';

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

 const formatDate = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Pacific/Auckland' });
  };

  const counts = data ? data.reduce((acc, row) => {
    const key = row.student_name;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}) : {};

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: '#1a1a1a', borderBottom: '4px solid #c04a1a', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, background: '#c04a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>DVC</div>
        <div>
          <div style={{ color: '#f5f0e8', fontWeight: 700, fontSize: 15, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Teacher Dashboard</div>
          <div style={{ color: '#888', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Albany Senior High School</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 20px' }}>
        {!data ? (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <div style={{ borderLeft: '4px solid #c04a1a', paddingLeft: 18, marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>Teacher Login</h1>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#555', lineHeight: 1.8 }}>Enter your teacher password to view student usage data.</p>
            </div>
            <div style={{ background: 'white', border: '2px solid #1a1a1a', padding: '28px 32px' }}>
              <label style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: 8 }}>Teacher Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="Enter password"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, border: '2px solid #1a1a1a', padding: '10px 14px', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
              />
              {error && <div style={{ background: '#fff0ed', border: '2px solid #c04a1a', padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#c04a1a', marginBottom: 16 }}>{error}</div>}
              <button onClick={login} disabled={loading} style={{ width: '100%', padding: 14, background: '#c04a1a', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
                {loading ? 'Loading...' : 'View Dashboard →'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ borderLeft: '4px solid #c04a1a', paddingLeft: 18, marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: 8 }}>Usage Dashboard</h1>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{data.length} total generations across all classes</p>
              </div>
              <button onClick={() => { setData(null); setPassword(''); }} style={{ background: '#1a1a1a', color: 'white', border: 'none', fontFamily: 'monospace', fontSize: 11, padding: '8px 16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Log Out
              </button>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
              {['1TECD', '2TECD', '3TECD'].map(cls => {
                const count = data.filter(r => r.class_code === cls).length;
                return (
                  <div key={cls} style={{ background: '#1a1a1a', padding: '16px 20px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c04a1a', marginBottom: 8 }}>{cls}</div>
                    <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{count}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#888', marginTop: 4 }}>generations</div>
                  </div>
                );
              })}
              <div style={{ background: '#c04a1a', padding: '16px 20px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white', opacity: 0.8, marginBottom: 8 }}>Total</div>
                <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{data.length}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'white', opacity: 0.8, marginTop: 4 }}>all classes</div>
              </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', border: '2px solid #1a1a1a', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    {['Student Name', 'Class', 'Tool', 'Times Used', 'Last Used'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c04a1a', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    data.reduce((acc, row) => {
                      const key = `${row.student_name}||${row.class_code}`;
                      if (!acc[key]) acc[key] = { ...row, count: 0 };
                      acc[key].count++;
                      if (new Date(row.created_at) > new Date(acc[key].created_at)) {
                        acc[key].created_at = row.created_at;
                      }
                      return acc;
                    }, {})
                  ).map(([key, row], i) => (
                    <tr key={key} style={{ borderBottom: '1px solid #e8e2d8', background: i % 2 === 0 ? 'white' : '#faf8f5' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{row.student_name}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12 }}>{row.class_code}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12 }}>{row.tool}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, textAlign: 'center' }}>
                        <span style={{ background: row.count > 3 ? '#c04a1a' : '#e8e2d8', color: row.count > 3 ? 'white' : '#1a1a1a', padding: '2px 10px', fontSize: 11 }}>{row.count}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{formatDate(row.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
