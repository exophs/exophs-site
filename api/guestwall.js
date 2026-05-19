import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://vhyboshqppbgzarylmuv.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

const COOLDOWN_MS = 30000;
const WEBHOOK = 'https://discord.com/api/webhooks/1506341555303223398/kzxoxhuE5GRFklOh0a-9oSvoPaX0zK7YmQgZ7rbo8nrAxK23W8F1nnWcP308xH69aJC0';

function isSpam(text) {
  if (text.length < 2) return true;
  if (/(.)\1{6,}/.test(text)) return true;
  if (text.split(' ').length === 1 && text.length > 40) return true;
  const words = text.toLowerCase().split(/\s+/);
  const unique = new Set(words);
  if (words.length > 4 && unique.size / words.length < 0.3) return true;
  return false;
}

async function getFingerprint(req) {
  const raw = [
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown',
    req.headers['user-agent'] || ''
  ].join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { message, nickname } = req.body;

  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'missing message' });
  if (message.trim().length < 2 || message.length > 200) return res.status(400).json({ error: 'invalid message length' });
  if (isSpam(message.trim())) return res.status(400).json({ error: 'spam detected' });

  const fp = await getFingerprint(req);

  const { data: cooldownRow } = await sb
    .from('guest_wall_cooldowns')
    .select('last_sent')
    .eq('ip_hash', fp)
    .single();

  if (cooldownRow) {
    const remaining = COOLDOWN_MS - (Date.now() - new Date(cooldownRow.last_sent).getTime());
    if (remaining > 0) {
      return res.status(429).json({ error: 'cooldown', remaining: Math.ceil(remaining / 1000) });
    }
  }

  const nick = nickname?.trim().slice(0, 24) || null;

  const { error } = await sb.from('guest_wall').insert({
    nickname: nick,
    message: message.trim(),
    source: 'web'
  });

  if (error) return res.status(500).json({ error: 'db error' });

  await sb.from('guest_wall_cooldowns').upsert({ ip_hash: fp, last_sent: new Date().toISOString() });

  await fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Guest Wall',
      embeds: [{
        description: message.trim(),
        color: 0xcba6f7,
        author: { name: nick || 'anonymous' },
        footer: { text: 'exophs.vercel.app · guest wall' },
        timestamp: new Date().toISOString()
      }]
    })
  }).catch(() => {});

  return res.status(200).json({ ok: true });
}
