import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkAuthUser } from '../middleware/checkUserExists'

export async function dietsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const listDiets = await knex('diets').select()

    return listDiets
  })

  app.post('/', { preHandler: [checkAuthUser] }, async (request, reply) => {
    const createDietsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      isInDiet: z.boolean(),
    })

    const { name, description, date, time, isInDiet } =
      createDietsBodySchema.parse(request.body)

    const { userId } = request.cookies

    await knex('diets').insert({
      id: randomUUID(),
      name,
      description,
      date,
      time,
      isInDiet,
      user_id: userId,
    })

    return reply.status(201).send()
  })
}
