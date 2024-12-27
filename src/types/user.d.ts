import { User } from "./api"

export type UserDetails = User

export type UserList = User[]

export type UserCreate = {
  username: User["username"],
}
