import { beforeAll, afterAll, describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    console.time('beforeEach')
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
    console.timeEnd('beforeEach')
  })

  it('should be able create an new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date: new Date(),
        isInDiet: true,
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const date = new Date()

    // create a new meal
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Almoço',
      description: 'Arroz, feijão, bife de frango grelhado e salada de alface',
      date,
      isInDiet: true,
    })

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date: date.toISOString(),
        is_in_diet: 1,
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const date = new Date()

    // create a new meal
    const createMealsResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date,
        isInDiet: true,
      })

    const mealId = createMealsResponse.body.id

    const listMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealResponse.body.meal).toEqual(
      expect.objectContaining({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date: date.toISOString(),
        is_in_diet: 1,
      }),
    )
  })

  it('should be able to delete a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const date = new Date()

    // create a new meal
    const createMealsResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date,
        isInDiet: true,
      })

    const mealId = createMealsResponse.body.id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)
    expect(listMealsResponse.body.meals).toEqual([])
  })

  it('should be able to edit a specific meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const date = new Date()

    // create a new meal
    const createMealsResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        title: 'Almoço',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date,
        isInDiet: true,
      })

    const mealId = createMealsResponse.body.id

    // edit a specific meal
    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        title: 'Jantar',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date,
        isInDiet: true,
      })
      .expect(201)

    const listMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        title: 'Jantar',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date,
        isInDiet: true,
      })

    expect(listMealResponse.body.meal).toEqual(
      expect.objectContaining({
        title: 'Jantar',
        description:
          'Arroz, feijão, bife de frango grelhado e salada de alface',
        date: date.toISOString(),
        is_in_diet: 1,
      }),
    )
  })

  it('should get the correct metrics', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // create a new meal
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Café da Manhã',
      description: 'Pão, ovo, café',
      date: new Date(),
      isInDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Almoço',
      description: 'Lasanha à bolonhesa',
      date: new Date(),
      isInDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Lanche da tarde',
      description: 'Iogurte com uvas e whey protein',
      date: new Date(),
      isInDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      title: 'Jantar',
      description: 'Arroz, feijão, bife de frango grelhado e salada de alface',
      date: new Date(),
      isInDiet: true,
    })

    const getMetrics = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .send()

    expect(getMetrics.body).toEqual({
      totalMeals: 4,
      inDietMeals: 3,
      notInDietMeals: 1,
      streak: 2,
    })
  })
})
