import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList, DinnerCreate } from "@t/dinner";
import { ApiEntitySet } from "./ApiEntitySet";
import { ApiEntityList } from "./ApiEntityList";


export const useDinnerStore = defineStore("dinner", () => {
  const dinnerList = new ApiEntityList<DinnerList, DinnerCreate>("/api/v1/dinners", []);
  const dinnerListRef = dinnerList.getComputedRef();
  
  const dinnerDetailsDefaults = {
    id: 0,
    ownerId: 0,
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
  });

  async function updateDinnerDetails (id: string) {
    try {
      await dinnerDetails.updateEntity(id);
    } catch (error) {
      // todo: use message handler
      alert("Error updating dinner details");
      console.error(error);
    }
  }

  async function deleteDinner (id: string) {
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

  return {
    dinnerList: dinnerListRef,
    dinnerDetails: dinnerDetailRefs,
    updateDinnerDetails,
    createDinner,
    deleteDinner
    // todo: check
    // reload: loadDinners,
  };
});
