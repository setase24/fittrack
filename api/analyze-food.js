export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { imageBase64, mediaType, nombre, ingredientes, extra } = req.body
    let content = []
    if (imageBase64) {
      content.push({ type: 'image', source: { type: 'base64', media_type: mediaType || 'image/jpeg', data: imageBase64 } })
    }
    const prompt = `Analiza este ${imageBase64 ? 'plato en la foto' : 'alimento'}: "${nombre || ''}" ${ingredientes ? `con ingredientes: ${ingredientes}` : ''} ${extra ? `extras: ${extra}` : ''}. Responde SOLO en JSON sin markdown ni texto adicional: {"nombre":"nombre del plato","ingredientes":"lista de ingredientes principales","calorias":número entero,"proteina_g":número,"carbos_g":número,"grasas_g":número}`
    content.push({ type: 'text', text: prompt })
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, messages: [{ role: 'user', content }] })
    })
    const data = await response.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json(parsed)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
