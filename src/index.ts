import { Person } from './types'

const p: Person = {
  name: '3213',
  age: 10
}

export const add = (person: Person) => {
  console.log({ person })
}

add(p)
