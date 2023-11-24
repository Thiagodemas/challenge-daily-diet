import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import { dietsRoutes } from './routes/diets'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(dietsRoutes, {
  prefix: 'diets',
})
