import { defineStore } from "pinia";
import type { UserList, UserCreate, UserDetails } from "@t/user";
import { ApiList } from "./ApiList";
import { ApiItemMap } from "./ApiItemMap";


export const useUserStore = defineStore("user", () => {
  const userList = new ApiList<UserList[number], UserCreate>("/api/v1/users");

  const userDetailsDefaults: UserDetails = {
    id: "0",
    username: ""
  };
  const userDetails = new ApiItemMap<UserDetails>("/api/v1/users/", userDetailsDefaults);

  async function updateUserDetails (id: string) {
    try {
      const item = userDetails.get(id);
      await item.save({ username: item.data.username });
    } catch (error) {
      // todo: use message handler
      alert("Error updating user details");
      console.error(error);
    }
  }

  async function deleteUser (id: string) {
    try {
      await userDetails.get(id).delete();
      userDetails.remove(id);
    } catch (error) {
      // todo: use message handler
      alert("Error deleting user");
      console.error(error);
    }
  }

  async function createUser () {
    const newUserData: UserCreate = {
      // todo: use i18n for default username
      username: "<New User>"
    };
    try {
      const newId = await userList.create(newUserData);
      return newId;
    } catch (error) {
      // todo: use message handler
      alert("Error creating user");
      console.error(error);
    }
  }

  return {
    userList,
    userDetails,
    updateUserDetails,
    createUser,
    deleteUser
  };
});
