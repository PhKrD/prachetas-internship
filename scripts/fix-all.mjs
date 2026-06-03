const A = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
const C = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const q = async (s) => {
  const r = await fetch(A, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': C }, body: JSON.stringify({ query: s, params: [] }) })
  const d = await r.json()
  if (d.message) throw new Error(d.message)
  return d.rows || []
}

// 1. Fix unattributed payments in Neon
const fixes = [
  { paymentId: 'pay_StYsqDRuOAmC8y', slug: 'sayali-vishwanath-pukale', note: 'Sayali self-donation ₹100' },
  { paymentId: 'pay_Ssl275UzDrm1Bs', slug: 'sanaa-vikram-joshi', note: 'Sanaa self-donation ₹1000' },
  { paymentId: 'pay_SqGqmPaNS9Aicf', slug: 'aadya-shah', note: 'Aadya self-donation ₹1001' },
  { paymentId: 'pay_Ss4xD09U8YAiPc', slug: 'nayan-daulat-suryawanshi', note: 'Snehal More ₹200 (was manual override)' },
  { paymentId: 'pay_SsIQq6gWg0YcWP', slug: 'kalyani-gajanan-jaybhaye', note: 'Rupali Balaji Lokhande ₹100 (was manual override)' },
]

for (const f of fixes) {
  await q(`UPDATE donations SET referred_by = '${f.slug}' WHERE payment_id = '${f.paymentId}' AND referred_by IS NULL`)
  console.log(`✓ ${f.paymentId} → ${f.slug} (${f.note})`)
}

// 2. Check Rohit discrepancy
console.log('\n=== Rohit Manish Jain audit ===')
const rohit = await q("SELECT payment_id, donor_name, amount, created_at FROM donations WHERE referred_by = 'rohit-manish-jain' AND status = 'completed' ORDER BY created_at")
for (const r of rohit) console.log(`  ${r.payment_id} | ${r.donor_name} | ₹${r.amount} | ${r.created_at}`)
const rohitTotal = rohit.reduce((s, r) => s + Number(r.amount), 0)
console.log(`  Neon total: ₹${rohitTotal}`)

console.log('\nDone.')
