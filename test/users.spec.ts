import { beforeAll, afterAll, describe, it, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
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

  it('should be able create an new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        email: 'gabilemos+1@gmail.com',
        password: 'senhadagabi',
      })
      .expect(201)
  })

  it('should be able to list all users', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    expect(listUsersResponse.body.users).toEqual([
      expect.objectContaining({
        email: 'gabilemos+1@gmail.com',
        password: 'senhadagabi',
      }),
    ])
  })

  it('should be able to get a specific user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsersResponse.body.users[0].id

    const getUserResponse = await request(app.server)
      .get(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({
        email: 'gabilemos+1@gmail.com',
        password: 'senhadagabi',
      }),
    )
  })

  it('should be able to delete an user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      email: 'gabilemos+1@gmail.com',
      password: 'senhadagabi',
    })

    console.log(createUserResponse.body)

    const cookies = createUserResponse.get('Set-Cookie')

    const listUsersResponse = await request(app.server)
      .get('/users')
      .set('Cookie', cookies)
      .expect(200)

    const userId = listUsersResponse.body.users[0].id

    await request(app.server)
      .delete(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200)
  })
})
