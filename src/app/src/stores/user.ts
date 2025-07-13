import { defineStore } from "pinia";
import type { UserList, UserCreate, UserDetails } from "@t/user";
import { ApiEntitySet } from "./ApiEntitySet";
import { ApiEntityList } from "./ApiEntityList";


export const useUserStore = defineStore("user", () => {
  const userList = new ApiEntityList<UserList, UserCreate>("/api/v1/users", []);
  const userListRef = userList.getComputedRef();
  
  const userDetailsDefaults = {
    id: "0",
    username: ""
  };
  const userDetails = new ApiEntitySet<UserDetails>("/api/v1/users/", userDetailsDefaults);
  const userDetailRefs = userDetails.getComputedRefs();

  // invalidate user list on relevant changes
  userDetails.updated.attach((event) => {
    const { data, dataBefore } = event.detail;

    if (!data || !dataBefore) {
      return;
    }

    if (data.username !== dataBefore.username) {
      userList.resetState();
    }
  });
  userDetails.deleted.attach((event) => {
    userList.resetState();
  });
  userList.created.attach((event) => {
    userList.resetState();
  });

  async function updateUserDetails (id: string) {
    try {
      await userDetails.updateEntity(id);
    } catch (error) {
      // todo: use message handler
      alert("Error updating user details");
      console.error(error);
    }
  }

  async function deleteUser (id: string) {
    try {
      await userDetails.deleteEntity(id);
    } catch (error) {
      // todo: use message handler
      alert("Error updating user details");
      console.error(error);
    }
  }
    

  async function createUser () {
    const newUserData = {
      // todo: use i18n for default username
      username: "<New User>"
    };
    try {
      const newId = await userList.create(newUserData);

      return newId;
    } catch (error) {
      // todo: use message handler
      alert("Error updating user details");
      console.error(error);
    }
  }

  return {
    userList: userListRef,
    userDetails: userDetailRefs,
    updateUserDetails,
    createUser,
    deleteUser
  };
});
