import { defineStore } from "pinia";
import type { DinnerDetails, DinnerList } from "@t/dinner";
import { ApiEntity } from "./ApiEntity";
import { ApiEntitySet } from "./ApiEntitySet";


export const useDinnerStore = defineStore("dinner", () => {
  const dinnerListApi = new ApiEntity<DinnerList>("/api/v1/dinners", []);
  const dinnerList = dinnerListApi.getComputedRef();
  const dinnerDetailsDefaults = {
    id: 0,
    ownerId: 0,
    username: "",
    date: new Date().toUTCString(),
    participants: [],
    courses: []
  };
  const dinnerDetailsApi = new ApiEntitySet<DinnerDetails>("/api/v1/dinners/", dinnerDetailsDefaults);
  const dinnerDetails = dinnerDetailsApi.getProxiedRefs();

  return {
    dinnerList,
    dinnerDetails,
    // todo: check
    // reload: loadDinners,
  };
});
