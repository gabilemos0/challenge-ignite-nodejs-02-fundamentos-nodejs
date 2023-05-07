import crypto, { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  app.get('/:id', async (request) => {
    const getUserParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamSchema.parse(request.params)

    const user = await knex('users').where('id', id).first()

    return { user }
  })

  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      email,
      password,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getUserParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamSchema.parse(request.params)

    await knex('users').where('id', id).delete('*')

    return reply.status(200).send()
  })
}
