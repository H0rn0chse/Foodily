import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList, DinnerCreate, DinnerId } from "@t/dinner";
import { ApiEntitySet } from "./ApiEntitySet";
import { ApiEntityList } from "./ApiEntityList";
import type { UserId } from "@t/api";


export const useDinnerStore = defineStore("dinner", () => {
  const dinnerList = new ApiEntityList<DinnerList, DinnerCreate>("/api/v1/dinners", []);
  const dinnerListRef = dinnerList.getComputedRef();
  
  const dinnerDetailsDefaults = {
    id: "0",
    ownerId: "0",
    username: "",
    title: "",
    date: new Date().toUTCString(),
    participants: [],
    courses: []
  };
  const dinnerDetails = new ApiEntitySet<DinnerDetails>("/api/v1/dinners/", dinnerDetailsDefaults);
  const dinnerDetailRefs = dinnerDetails.getComputedRefs();

  // invalidate dinner list on relevant changes
  dinnerDetails.updated.attach((event) => {
    const { data, dataBefore } = event.detail;

    if (!data || !dataBefore) {
      return;
    }

    if (data.ownerId !== dataBefore.ownerId
      || data.username !== dataBefore.username
      || data.title !== dataBefore.title
      || data.date !== dataBefore.date
    ) {
      dinnerList.resetState();
    }
  });
  dinnerDetails.deleted.attach((event) => {
    dinnerList.resetState();
  });
  dinnerList.created.attach((event) => {
    dinnerList.resetState();
    dinnerDetails.resetEntityState(event.detail.entityId);
  });

  async function updateDinnerDetails (id: DinnerId) {
    try {
      await dinnerDetails.updateEntity(id);
    } catch (error) {
      // todo: use message handler
      alert("Error updating dinner details");
      console.error(error);
    }
  }

  async function deleteDinner (id: DinnerId) {
    try {
      await dinnerDetails.deleteEntity(id);
    } catch (error) {
      // todo: use message handler
      alert("Error updating dinner details");
      console.error(error);
    }
  }
    

  async function createDinner () {
    const newDinnerData = {
      // todo: use i18n for default title
      title: "<New Dinner>",
      date: new Date().toUTCString()
    };
    try {
      const newId = await dinnerList.create(newDinnerData);

      return newId;
    } catch (error) {
      // todo: use message handler
      alert("Error updating dinner details");
      console.error(error);
    }
  }

  async function addParticipants (dinnerId: DinnerId, userIds: UserId[]) {
    try {
      await fetch(`/api/v1/dinners/${dinnerId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userIds
        })
      });
      dinnerDetails.resetEntityState(dinnerId);
    } catch (error) {
      console.error(error);
    }
  }

  async function removeParticipant (dinnerId: DinnerId, userId: UserId) {
    try {
      await fetch(`/api/v1/dinners/${dinnerId}/participants/${userId}`, {
        method: "DELETE",
      });
      dinnerDetails.resetEntityState(dinnerId);
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteCourse (dinnerId: DinnerId, courseId: string) {
    try {
      await fetch(`/api/v1/dinners/${dinnerId}/courses/${courseId}`, {
        method: "DELETE",
      });
      dinnerDetails.resetEntityState(dinnerId);
    } catch (error) {
      console.error(error);
    }
  }
    
  return {
    dinnerList: dinnerListRef,
    dinnerDetails: dinnerDetailRefs,
    updateDinnerDetails,
    createDinner,
    deleteDinner,

    addParticipants,
    removeParticipant,

    deleteCourse,

    // todo: check
    // reload: loadDinners,
  };
});
