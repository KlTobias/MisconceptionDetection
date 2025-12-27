import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'code is required' })

  try {
    // use Node's global fetch (available in Node 18+)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: `Analyze this ${code}` }]
      })
    })

    const data = await resp.json()
    return res.json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'analysis failed' })
  }
})

export default router
