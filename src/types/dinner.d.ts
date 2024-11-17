import { User } from "./api"

export type DinnerList = {
  id: number,
  ownerId: number,
  username: string,
  title: string,
  date: string,
}[]
export type DinnerCreate = {
  title: string,
  date: string
}

export type DinnerDetails = {
  id: number,
  ownerId: number,
  username: string,
  title: string,
  date: string,
  participants: User[],
  courses: Course[]
}

export type Course = {
  id: number,
  courseNumber: number,
  main: boolean,
  title: string,
  description: string,
  type: string,
  vegetarian: boolean,
}
