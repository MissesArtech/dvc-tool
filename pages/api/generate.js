import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const PASSWORDS = {
  '1TECD': true,
  '2TECD': true,
  '3TECD': true,
};

const FUSION_PROMPT = `You are an expert industrial designer and Autodesk Fusion 360 specialist helping high school students DVC translate hand-drawn product designs into 3D CAD models.

Analyse the student's hand-drawn coffee maker sketch and produce two things:

SECTION 1: Written instructions using these exact headers:

DESIGN ANALYSIS
(3-4 sentences describing what you see: overall form, key components, interesting design choices)

KEY COMPONENTS
(bullet list of the main 3D parts you can identify)

FUSION 360 STEPS
(6-10 numbered steps, each with a short title then the instruction. Reference real Fusion 360 tools by name: Sketch, Extrude, Revolve, Loft, Shell, Fillet, Mirror, Component, Joint. Build from simple to complex.)

DESIGN TIPS
(2-3 practical tips specific to this design)

SECTION 2: A Fusion 360 Python script using this exact header on its own line:

FUSION360_SCRIPT
(Write a complete Fusion 360 API Python script that creates simple primitive shapes representing the main components of this coffee maker. Use only basic operations: createBox, createCylinder, simple extrusions. Keep it beginner-friendly with clear comments. The script must be complete and runnable. Start with: import adsk.core, adsk.fusion, traceback)

Keep all language practical, clear and encouraging. Do not use markdown symbols like ** or ##.`;

const SKETCHUP_PROMPT = `You are an expert architect and SketchUp specialist helping high school students DVC translate hand-drawn architectural designs into 3D models.

Analyse the student's hand-drawn architectural sketch and produce clear beginner-friendly SketchUp instructions.

Use these exact section headers on their own lines:

DESIGN ANALYSIS
(3-4 sentences describing what you see: overall form, key architectural features, interesting design choices)

KEY ELEMENTS
(bullet list of the main architectural elements you can identify)

SKETCHUP STEPS
(6-10 numbered steps, each with a short title then the instruction. Reference real SketchUp tools by name: Rectangle, Push/Pull, Line, Arc, Offset, Follow Me, Paint Bucket, Components, Groups, Scenes. Build from simple to complex.)

DESIGN TIPS
(2-3 practical tips specific to this design)

Keep language practical, clear and encouraging. Do not use markdown symbols like ** or ##.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { image, mediaType, prompt, password, studentName, tool } = req.body;

  if (!PASSWORDS[password]) {
    return res.status(401).json({ error: 'Invalid class password' });
  }

  if (!studentName || studentName.trim() === '') {
    return res.status(400).json({ error: 'Please enter your name' });
  }

  try {
    const systemPrompt = tool === 'sketchup' ? SKETCHUP_PROMPT : FUSION_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: prompt || 'Please analyse this design and give me step by step instructions.' }
        ]
      }]
    });

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

    // Split out the script if present
    let instructions = text;
    let script = null;

    const scriptMarker = 'FUSION360_SCRIPT';
    const scriptIndex = text.indexOf(scriptMarker);
    if (scriptIndex !== -1) {
      instructions = text.slice(0, scriptIndex).trim();
      script = text.slice(scriptIndex + scriptMarker.length).trim();
    }

    await supabase.from('usage').insert({
      student_name: studentName.trim(),
      class_code: password,
      tool: tool === 'sketchup' ? 'SketchUp' : 'Fusion 360',
    });

    res.status(200).json({ result: instructions, script });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
