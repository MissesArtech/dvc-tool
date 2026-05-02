import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;

  if (password !== TEACHER_PASSWORD) {
    return res.status(401).json({ error: 'Invalid teacher password' });
  }

  try {
    const { data, error } = await supabase
      .from('usage')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
