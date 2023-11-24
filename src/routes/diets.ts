import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { checkAuthUser } from '../middleware/checkUserExists'

interface Metrics {
  inDietPercentage: number
  bestSequency: number
  total: number
  totalInDiet: number
  totalOutDiet: number
}

export async function dietsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkAuthUser)

  app.get('/', async (request) => {
    const { userId } = request.cookies

    const listDiets = await knex('diets').where('user_id', userId).select()

    return listDiets
  })

  app.get('/:id', async (request) => {
    const userQuerySchema = z.object({
      id: z.string(),
    })
    const { id } = userQuerySchema.parse(request.params)
    const { userId } = request.cookies

    const listDiets = await knex('diets')
      .where({ id, user_id: userId })
      .select()

    return listDiets
  })

  app.post('/', async (request, reply) => {
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

  app.put('/:id', async (request, reply) => {
    const editDietsBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      time: z.string(),
      isInDiet: z.boolean(),
    })

    const userQuerySchema = z.object({
      id: z.string(),
    })
    const { id } = userQuerySchema.parse(request.params)

    const { name, description, date, time, isInDiet } =
      editDietsBodySchema.parse(request.body)

    await knex('diets')
      .where({ id })
      .update({
        name,
        description,
        date,
        time,
        isInDiet,
      })
      .returning('*')

    return reply.status(200).send()
  })

  app.delete('/:id', async (request, reply) => {
    const userQuerySchema = z.object({
      id: z.string(),
    })
    const { id } = userQuerySchema.parse(request.params)
    const { userId } = request.cookies

    const deletionResult = await knex('diets')
      .where({ id, user_id: userId })
      .delete()

    if (deletionResult === 0) {
      return reply
        .status(404)
        .send({ message: 'Meal not found or user does not have permission.' })
    }

    return reply.status(200).send({ message: 'Diet deleted.' })
  })

  app.get('/metrics', async (request, reply) => {
    const { userId } = request.cookies

    const diets = await knex('diets').where('user_id', userId).select()

    if (!diets) {
      return reply.status(404).send({ message: 'Not found.' })
    }

    const metrics = {
      total: diets.length,
      bestSequency: 0,
      inDietPercentage: 0,
      totalInDiet: 0,
      totalOutDiet: 0,
    } as Metrics

    let auxSequency = 0

    diets.forEach((diet) => {
      if (diet.isInDiet) {
        metrics.totalInDiet += 1
        auxSequency += 1
        if (auxSequency > metrics.bestSequency) {
          metrics.bestSequency = auxSequency
        }
      } else {
        metrics.totalOutDiet += 1
        auxSequency = 0
      }
    })

    metrics.inDietPercentage = metrics.totalInDiet / 8

    return reply.status(200).send({ metrics })
  })
}
