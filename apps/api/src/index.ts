import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { AdjustPointsSchema } from '@repo/shared'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/points/adjust',
  zValidator('json', AdjustPointsSchema),
  (c) => {
    const data = c.req.valid('json')
    // Data di sini sudah divalidasi dan memiliki tipe data yang benar
    return c.json({ message: `Berhasil menyesuaikan ${data.amount} poin` })
  }
)

export default app
