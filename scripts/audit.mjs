const A = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
const C = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const q = async (s) => {
  const r = await fetch(A, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': C }, body: JSON.stringify({ query: s, params: [] }) })
  const d = await r.json()
  if (d.message) throw new Error(d.message)
  return d.rows || []
}

// 1. Check for Yugal's ₹1000 payment on May 26
const y = await q("SELECT payment_id, referred_by, donor_name, amount, status, created_at FROM donations WHERE amount = 1000 AND created_at >= '2026-05-26' AND created_at < '2026-05-27' AND status = 'completed'")
console.log('=== ₹1000 payments on May 26 ===')
for (const r of y) console.log(`  ${r.payment_id} | ${r.donor_name} | ₹${r.amount} | ref=${r.referred_by || 'NULL'}`)

// 2. Recent unattributed payments (May 2026)
const u = await q("SELECT payment_id, donor_name, amount, created_at FROM donations WHERE referred_by IS NULL AND status = 'completed' AND created_at >= '2026-05-01' ORDER BY created_at DESC")
console.log('\n=== Unattributed payments (May 2026+) ===')
for (const r of u) console.log(`  ${r.payment_id} | ${r.donor_name} | ₹${r.amount} | ${r.created_at}`)
console.log(`  Count: ${u.length}`)
