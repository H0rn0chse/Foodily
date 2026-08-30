import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList, DinnerCreate, DinnerId, Course } from "@t/dinner";
import { ApiList } from "./ApiList";
import { ApiItemMap } from "./ApiItemMap";
import type { UserId } from "@t/api";
import { csrfHeaders } from "@/js/csrf";

const courseDefaults: Course = {
  id: "0",
  courseNumber: 0,
  title: "",
  description: "",
  type: "main",
  vegetarian: false,
  vegan: false,
};

export const useDinnerStore = defineStore("dinner", () => {
  const dinnerList = new ApiList<DinnerList[number], DinnerCreate>("/api/v1/dinners");

  const dinnerDetailsDefaults: DinnerDetails = {
    id: "0",
    ownerId: "0",
    username: "",
    title: "",
    date: new Date().toUTCString(),
    participants: [],
    courses: []
  };
  const dinnerDetails = new ApiItemMap<DinnerDetails>("/api/v1/dinners/", dinnerDetailsDefaults);

  // Per-dinner course wrappers — kept outside the returned store object so they
  // are never wrapped in Pinia's reactive proxy.
  const courseLists = new Map<DinnerId, ApiList<Course, Partial<Course>>>();
  const courseItemMaps = new Map<DinnerId, ApiItemMap<Course>>();

  function getCourseList(dinnerId: DinnerId): ApiList<Course, Partial<Course>> {
    if (!courseLists.has(dinnerId)) {
      courseLists.set(dinnerId, new ApiList<Course, Partial<Course>>(`/api/v1/dinners/${dinnerId}/courses`));
    }
    return courseLists.get(dinnerId)!;
  }

  function getCourseItemMap(dinnerId: DinnerId): ApiItemMap<Course> {
    if (!courseItemMaps.has(dinnerId)) {
      courseItemMaps.set(dinnerId, new ApiItemMap<Course>(`/api/v1/dinners/${dinnerId}/courses/`, courseDefaults));
    }
    return courseItemMaps.get(dinnerId)!;
  }

  async function updateDinnerDetails (id: DinnerId) {
    try {
      const item = dinnerDetails.get(id);
      await item.save({
        title: item.data.title,
        date: item.data.date,
      });
    } catch (error) {
      // todo: use message handler
      alert("Error updating dinner details");
      console.error(error);
    }
  }

  async function deleteDinner (id: DinnerId) {
    try {
      await dinnerDetails.get(id).delete();
      dinnerDetails.remove(id);
    } catch (error) {
      // todo: use message handler
      alert("Error deleting dinner");
      console.error(error);
    }
  }

  async function createDinner () {
    const newDinnerData: DinnerCreate = {
      // todo: use i18n for default title
      title: "<New Dinner>",
      date: new Date().toUTCString()
    };
    try {
      const newId = await dinnerList.create(newDinnerData);
      return newId;
    } catch (error) {
      // todo: use message handler
      alert("Error creating dinner");
      console.error(error);
    }
  }

  // Participants use non-standard POST body ({ userIds }) and return 200 (no
  // Location header), so they don't fit ApiList.create() — kept as raw fetch.
  async function addParticipants (dinnerId: DinnerId, userIds: UserId[]) {
    try {
      await fetch(`/api/v1/dinners/${dinnerId}/participants`, {
        method: "POST",
        headers: csrfHeaders({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ userIds })
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function removeParticipant (dinnerId: DinnerId, userId: UserId) {
    try {
      await fetch(`/api/v1/dinners/${dinnerId}/participants/${userId}`, {
        method: "DELETE",
        headers: csrfHeaders()
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function createCourse (dinnerId: DinnerId, courseData: Partial<Course>) {
    try {
      return await getCourseList(dinnerId).create(courseData);
    } catch (error) {
      console.error(error);
    }
  }

  async function updateCourse (dinnerId: DinnerId, courseId: string, updatedData: Partial<Course>) {
    try {
      await getCourseItemMap(dinnerId).get(courseId).save(updatedData);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteCourse (dinnerId: DinnerId, courseId: string) {
    try {
      const map = getCourseItemMap(dinnerId);
      await map.get(courseId).delete();
      map.remove(courseId);
    } catch (error) {
      console.error(error);
    }
  }

  return {
    dinnerList,
    dinnerDetails,
    updateDinnerDetails,
    createDinner,
    deleteDinner,

    addParticipants,
    removeParticipant,

    createCourse,
    updateCourse,
    deleteCourse,
  };
});
