import { studentsData } from '../src/data/studentsData.js'

const STATS_URL = 'https://prachetasfoundation.com/.netlify/functions/student-stats'
const SLUG_MAPPING = {
  'amruta-shriramjwar-m9ah': 'amruta-shriramjwar',
  'aryan-khairkhar-b1': 'aryan-khairkhar',
  'mukul-manohar-bhosale]': 'mukul-manohar-bhosale',
  'aman-khandelwal-k3mz': 'aman-khandelwal-k3mz',
}
const normalizeSlug = (s) => SLUG_MAPPING[s] || s
const sigOf = (d) => `${String(d.name || '').trim().toLowerCase()}|${Number(d.amount)}|${d.date}|${d.type}`

const MANUAL_DONOR_OVERRIDES = {
  'parth-patil': [{ paymentId: 'utr_485020494237', name: 'PhonePe Donor', amount: 500, date: '2026-05-20', type: 'One-time' }],
  'shambhavi-sachin-jagtap': [{ paymentId: 'manual_shambhavi_anon_500_2026_05_24', name: 'Anonymous', amount: 500, date: '2026-05-24', type: 'One-time' }],
  'kalyani-gajanan-jaybhaye': [
    { paymentId: 'upi_002404886084', name: 'Rupali Balaji Lokhande', amount: 100, date: '2026-05-22', type: 'One-time' },
    { paymentId: 'utr_982212016672', name: 'PhonePe Donor', amount: 200, date: '2026-05-22', type: 'One-time' },
    { paymentId: 'paytm_ref_306648792547', name: 'satish doiphode', amount: 500, date: '2026-05-23', type: 'One-time' },
  ],
  'nayan-daulat-suryawanshi': [{ paymentId: 'upi_614120990477', name: 'Snehal Ravindra More', amount: 200, date: '2026-05-21', type: 'One-time' }],
}

const statsRes = await fetch(`${STATS_URL}?t=${Date.now()}`).then(r => r.json()).catch(() => ({ success: false }))
let donors = {}
if (statsRes.success && statsRes.donors) {
  for (const [slug, donorList] of Object.entries(statsRes.donors)) {
    const ns = normalizeSlug(slug)
    const existing = donors[ns] || []
    const ids = new Set(existing.map(d => d.paymentId).filter(Boolean))
    const sigs = new Set(existing.map(sigOf))
    for (const d of donorList) {
      const sig = sigOf(d)
      if ((d.paymentId && ids.has(d.paymentId)) || sigs.has(sig)) continue
      existing.push(d)
    }
    donors[ns] = existing
  }
}
for (const [slug, manualDonors] of Object.entries(MANUAL_DONOR_OVERRIDES)) {
  const existing = [...(donors[slug] || [])]
  const ids = new Set(existing.map(d => d.paymentId).filter(Boolean))
  const sigs = new Set(existing.map(sigOf))
  for (const d of manualDonors) {
    const sig = sigOf(d)
    if ((d.paymentId && ids.has(d.paymentId)) || sigs.has(sig)) continue
    existing.push(d)
  }
  donors[slug] = existing
}

const batches = { 1: [], 2: [], 3: [], 4: [] }
for (const s of studentsData) {
  const d = donors[s.slug] || []
  const total = d.reduce((sum, x) => sum + Number(x.amount), 0)
  if (total === 0) batches[s.batch].push(s.name)
}

for (const b of [1, 2, 3, 4]) {
  const list = batches[b]
  console.log(`\n=== BATCH ${b} (${list.length} students with zero funds) ===`)
  list.forEach((n, i) => console.log(`  ${i + 1}. ${n}`))
}
const totalZero = Object.values(batches).flat().length
console.log(`\nTOTAL: ${totalZero} students with zero funds raised`)
