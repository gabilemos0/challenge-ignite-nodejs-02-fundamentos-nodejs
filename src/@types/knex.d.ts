// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      password: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      user_id: string
      title: string
      description: string
      date: string
      is_in_diet: boolean
      created_at: string
    }
  }
}
