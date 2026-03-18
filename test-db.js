const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const obj = {};
envFile.split('\n').filter(Boolean).forEach(x => {
  const [k, ...v] = x.split('=');
  obj[k] = v.join('=').replace(/"/g, '');
});

const supa = createClient(obj.NEXT_PUBLIC_SUPABASE_URL, obj.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supa.from('purchases').select('total_amount, created_at').limit(1).then(x => console.log(JSON.stringify(x)));
