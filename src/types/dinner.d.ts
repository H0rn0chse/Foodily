import { User } from "./api";

export type DinnerDetails = {
  id: string,
  ownerId: string,
  username: string,
  title: string,
  date: string,
  participants: User[], // in DB this is only a list of user ids
  courses: Course[] // in DB this is only a list of course ids
}

export type DinnerListEntry = Omit<DinnerDetails, "participants" | "courses">;
export type DinnerList = DinnerListEntry[];

export type DinnerCreate = {
  title: DinnerDetails["title"],
  date: DinnerDetails["date"]
}

export type Course = {
  id: string,
  courseNumber: number,
  main: boolean,
  title: string,
  description: string,
  type: string,
  vegetarian: boolean,
}

// shortcuts
export type DinnerId = DinnerDetails["id"];
export type CourseId = Course["id"];
