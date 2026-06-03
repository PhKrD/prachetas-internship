export async function handler(event, context) {
  const NEON_API = 'https://api.c-3.us-east-1.aws.neon.tech/sql'
  const NEON_CONN = 'postgresql://neondb_owner:npg_4JGziLHbTnx5@ep-withered-block-ahmd8lhh-pooler.c-3.us-east-1.aws.neon.tech/neondb'

  try {
    const res = await fetch(NEON_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_CONN,
      },
      body: JSON.stringify({
        query: `SELECT donor_name, amount, subscription_id, created_at, referred_by
                FROM donations
                WHERE status = 'completed'
                ORDER BY created_at DESC`,
        params: [],
      }),
    })

    const data = await res.json()
    if (data.message) throw new Error(data.message)

    const donors = (data.rows || []).map(row => ({
      name: row.donor_name || 'Anonymous',
      amount: Number(row.amount),
      date: new Date(row.created_at).toISOString().split('T')[0],
      type: row.subscription_id ? 'SIP' : 'One-time',
      referredBy: row.referred_by || null,
    }))

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true, donors }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: false, error: err.message }),
    }
  }
}
