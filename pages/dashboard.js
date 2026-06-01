import { useState } from 'react';

const B = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  orange: '#FF5C00',
  grey: '#1A1A1A',
  greyMid: '#2A2A2A',
  greyLight: '#444444',
  offwhite: '#F0F0F0',
};

const mono = "'Montserrat', sans-serif";
const sans = "'Bebas Neue', 'Arial Black', sans-serif";

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; }
  ::placeholder { color: #555; }
  input:focus { outline: none; border-color: #FF5C00 !important; }
`;

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
    return d.toLocaleDateString('en-NZ', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Pacific/Auckland'
    });
  };

  const aggregated = data ? Object.values(
    data.reduce((acc, row) => {
      const key = `${row.student_name}||${row.class_code}`;
      if (!acc[key]) acc[key] = { ...row, count: 0 };
      acc[key].count++;
      if (new Date(row.created_at) > new Date(acc[key].created_at)) {
        acc[key].created_at = row.created_at;
      }
      return acc;
    }, {})
  ) : [];

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
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          width: 48, height: 48,
          background: '#FF5C00',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 16, flexShrink: 0,
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: B.black }} />
        </div>
        <div>
          <div style={{ fontFamily: sans, fontSize: 22, color: B.white, letterSpacing: '0.12em', lineHeight: 1 }}>DVC WITH KIM</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: '#FF5C00', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Teacher Dashboard</div>
        </div>
      </div>
      {data && (
        <button onClick={() => { setData(null); setPassword(''); }}
          style={{ background: 'transparent', color: B.grey
