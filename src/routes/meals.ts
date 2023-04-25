import crypto from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

import { getUserId } from '../middlewares/get-user-id'
import { getLargestStreak } from '../middlewares/get-largest-streak'
import { unauthorized } from '../middlewares/unauthorized-session-id'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  app.get('/:id', async (request, reply) => {
    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamSchema.parse(request.params)

    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const meal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .select()

    return { meal }
  })

  app.get('/metrics', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const meals = await knex('meals').where('user_id', userId).select()

    const totalMeals = meals.length

    const inDietMeals = meals.filter((meal) => meal.is_in_diet).length
    const notInDietMeals = meals.filter((meal) => !meal.is_in_diet).length

    const streak = getLargestStreak(meals)
    console.log(streak)

    return { totalMeals, inDietMeals, notInDietMeals, streak }
  })

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      isInDiet: z.boolean(),
    })

    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const { title, description, date, isInDiet } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      description,
      date,
      is_in_diet: isInDiet,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (request, reply) => {
    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamSchema.parse(request.params)

    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const editMealBodySchema = z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      isInDiet: z.boolean(),
    })

    const { title, description, date, isInDiet } = editMealBodySchema.parse(
      request.body,
    )

    const currentMeals = await knex('meals').where({ id }).select()
    const meal = currentMeals[0]
    if (meal.user_id !== userId) {
      return unauthorized(reply)
    }

    await knex('meals').where({ id }).select().update({
      title,
      description,
      date,
      is_in_diet: isInDiet,
    })

    return reply.status(201).send()
  })

  app.delete('/:id', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return unauthorized(reply)
    }

    const getMealParamSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamSchema.parse(request.params)

    const currentMeals = await knex('meals').where({ id }).select()
    const meal = currentMeals[0]
    if (meal.user_id !== userId) {
      return unauthorized(reply)
    }

    await knex('meals').where('id', id).delete('*')

    return reply.status(201).send()
  })
}
