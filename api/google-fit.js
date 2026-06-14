export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { accessToken } = req.body
    if (!accessToken) return res.status(400).json({ error: 'No token', pasos: 0 })
    const hoy = new Date()
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime()
    const fin = inicio + 86400000
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: 'com.google.step_count.delta', dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps' }],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: inicio,
        endTimeMillis: fin
      })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message, pasos: 0 })
    const pasos = data.bucket?.[0]?.dataset?.[0]?.point?.reduce((s, p) => s + (p.value?.[0]?.intVal||0), 0) || 0
    res.status(200).json({ pasos })
  } catch (e) {
    res.status(500).json({ error: e.message, pasos: 0 })
  }
}
