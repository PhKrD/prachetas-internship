import { studentsData } from '../src/data/studentsData.js'

const A = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
const C = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'
const q = async (s) => {
  const r = await fetch(A, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': C }, body: JSON.stringify({ query: s, params: [] }) })
  const d = await r.json()
  if (d.message) throw new Error(d.message)
  return d.rows || []
}

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const statsRes = await fetch(`${STATS_URL}?t=${Date.now()}`).then(r => r.json())

// Build student name→slug map (lowercased partial matches)
const nameToSlug = {}
for (const s of studentsData) {
  const parts = s.name.toLowerCase().split(' ')
  nameToSlug[s.name.toLowerCase()] = s.slug
  // also map last-name combos
  if (parts.length >= 2) nameToSlug[parts.slice(0, 2).join(' ')] = s.slug
}

// Unattributed payments (May 2026, excluding ₹250 registration batch)
const unattr = await q("SELECT payment_id, donor_name, amount, created_at FROM donations WHERE referred_by IS NULL AND status = 'completed' AND created_at >= '2026-05-01' AND amount != 250 ORDER BY created_at DESC")

console.log(`=== ${unattr.length} unattributed payments (May 2026+, excl ₹250) ===\n`)
const possibleMatches = []
for (const r of unattr) {
  const dn = (r.donor_name || '').trim().toLowerCase()
  let matched = nameToSlug[dn] || null
  if (!matched) {
    // Try partial name match against student names
    for (const s of studentsData) {
      const sn = s.name.toLowerCase()
      if (dn.includes(sn.split(' ')[0]) && dn.includes(sn.split(' ').pop())) {
        matched = s.slug + ' (fuzzy)'
        break
      }
    }
  }
  const flag = matched ? ` ← POSSIBLE: ${matched}` : ''
  console.log(`  ${r.payment_id} | ${r.donor_name} | ₹${r.amount} | ${new Date(r.created_at).toISOString().slice(0,10)}${flag}`)
  if (matched) possibleMatches.push({ ...r, matchedSlug: matched })
}

// Also: compare Neon totals vs student-stats totals for all students
console.log('\n=== Neon vs student-stats discrepancies ===')
const neonTotals = await q("SELECT referred_by, SUM(amount) as total, COUNT(*) as cnt FROM donations WHERE status = 'completed' AND referred_by IS NOT NULL GROUP BY referred_by ORDER BY referred_by")
const neonMap = {}
for (const r of neonTotals) neonMap[r.referred_by] = { total: Number(r.total), cnt: Number(r.cnt) }

let discrepancies = 0
for (const s of studentsData) {
  const neon = neonMap[s.slug] || { total: 0, cnt: 0 }
  const stats = statsRes.stats?.[s.slug] || { totalAmountCollected: 0 }
  const statsTotal = stats.totalAmountCollected || 0
  if (Math.abs(neon.total - statsTotal) > 0.01) {
    console.log(`  ${s.slug}: Neon=₹${neon.total} (${neon.cnt} txns) vs Stats=₹${statsTotal} → diff=₹${(statsTotal - neon.total).toFixed(2)}`)
    discrepancies++
  }
}
if (discrepancies === 0) console.log('  No discrepancies found!')
