import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const ListUser = await knex('users').select()

    return ListUser
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    let userId = request.cookies.userId

    if (!userId) {
      userId = crypto.randomUUID()

      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: userId,
      name,
    })

    return reply.status(201).send()
  })
}
