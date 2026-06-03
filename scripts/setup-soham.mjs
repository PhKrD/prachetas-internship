const NEON_API  = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
const NEON_CONN = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'

const q = async (sql) => {
  const r = await fetch(NEON_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': NEON_CONN },
    body: JSON.stringify({ query: sql, params: [] }),
  })
  const d = await r.json()
  if (d.message) throw new Error(d.message)
  return d.rows || []
}

// Insert Soham Tiwari into fundraiser_links (idempotent)
const existing = await q("SELECT id FROM fundraiser_links WHERE slug = 'soham-tiwari'")
if (existing.length === 0) {
  await q("INSERT INTO fundraiser_links (slug, student_name, roll_no, batch, is_active, show_on_dashboard) VALUES ('soham-tiwari', 'Soham Tiwari', 'COEP-B4', 'COEP Social Internship - Batch 4', true, true)")
  console.log('✓ Inserted soham-tiwari into fundraiser_links')
} else {
  await q("UPDATE fundraiser_links SET is_active = true, show_on_dashboard = true WHERE slug = 'soham-tiwari'")
  console.log('✓ soham-tiwari already existed — ensured active')
}

// Deactivate removed students' fundraiser links
const dropped = [
  'archit-manoj-deshpande', 'arnav-tejas-padhye', 'hrida-pattanshetti',
  'sharwil-shimpi', 'preesha-manoj-motwani', 'areen-yatin-valsangkar',
  'himanshu-ramesh-pujari', 'pransh-govind-chandak', 'sarthak-neeraj-bhaskar',
  'saksham-nilesh-patil', 'yash-ramprasad-ambhure',
]
for (const slug of dropped) {
  await q(`UPDATE fundraiser_links SET is_active = false, show_on_dashboard = false WHERE slug = '${slug}'`)
  console.log(`  Deactivated ${slug}`)
}

console.log('\nDone.')
