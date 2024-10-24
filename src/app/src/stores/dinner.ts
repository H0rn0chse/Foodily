import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList } from "@t/dinner";
import { ApiEntitySet } from "./ApiEntitySet";
import { ApiEntityList } from "./ApiEntityList";


export const useDinnerStore = defineStore("dinner", () => {
  const dinnerListApi = new ApiEntityList<DinnerList>("/api/v1/dinners", []);
  const dinnerList = dinnerListApi.getComputedRef();
  const dinnerDetailsDefaults = {
    id: 0,
    ownerId: 0,
    username: "",
    title: "",
    date: new Date().toUTCString(),
    participants: [],
    courses: []
  };
  const dinnerDetailsApi = new ApiEntitySet<DinnerDetails>("/api/v1/dinners/", dinnerDetailsDefaults);
  const dinnerDetails = dinnerDetailsApi.getProxiedRefs();

  function updateDinnerDetails (id: string) {
    dinnerDetailsApi.updateEntity(id);
  }

  // todo: handle reload of dependent entities / or lists

  return {
    dinnerList,
    dinnerDetails,
    updateDinnerDetails
    // todo: check
    // reload: loadDinners,
  };
});
