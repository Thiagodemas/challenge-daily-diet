// eslint-disable-next-line
import { Knex} from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      created_at: string
    }
    diet: {
      id: string
      name: string
      description: string
      date: string
      time: string
      isDiet: boolean
    }
  }
}
