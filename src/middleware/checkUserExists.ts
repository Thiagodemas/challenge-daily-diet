import { FastifyRequest, FastifyReply } from 'fastify'
import { knex } from '../database'

export async function checkAuthUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.cookies

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }

  const existingUser = await knex('users').where({ id: userId }).first()

  if (!existingUser) {
    return reply.status(404).send({ message: 'User not found!' })
  }

  console.log(userId)
}
