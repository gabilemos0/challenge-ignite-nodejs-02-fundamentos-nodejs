import { FastifyReply } from 'fastify'

export function unauthorized(reply: FastifyReply) {
  return reply.status(401).send({
    error: 'Unauthorized.',
  })
}
