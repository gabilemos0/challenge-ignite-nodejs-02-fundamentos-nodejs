import { knex } from '../database'
import { FastifyRequest } from 'fastify'

export async function getUserId(
  request: FastifyRequest,
): Promise<string | null> {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return null
  }

  const users = await knex('users').where('session_id', sessionId).select()
  if (!users.length) {
    return null
  }

  const userId = users[0].id

  return userId
}
