<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { computed, ref, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import LoadingScreen from "@/components/LoadingScreen.vue";
import UserSelectionCard from "@/components/UserSelectionCard.vue";
import type { UserId } from "@t/api";
const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const expandAllCategories = route.query.expandAllCategories === "true";

let dinnerId = 0;
let { dinnerId: dinnerIds } = route.params;

if (Array.isArray(dinnerIds)) {
  const [firstDinnerId] = dinnerIds;
  dinnerId = parseInt(firstDinnerId, 10);
} else {
  dinnerId = parseInt(dinnerIds, 10);
}

// activator cannot handle the ref pointing to null, which is the case before mounted. In reality, this is not a problem.
const addParticipantButton = useTemplateRef("addParticipantButton") as any;

const dinnerStore = useDinnerStore();
const dinnerDetails = dinnerStore.dinnerDetails[dinnerId];
const dinnerDetailsDate = computed({
  get: () => {
    return formatDate(new Date(dinnerDetails.value.data.date));
  },
  set: (newDateString) => {
    dinnerDetails.value.data.date = new Date(newDateString).toISOString();
  }
});

const dinnerDetailsCourseRating = computed({
  get: () => {
    const courseRating: Record<string, number> = {};
    for (const course of dinnerDetails.value.data.courses) {
      // todo: do proper rating calculation
      courseRating[course.id] = 2.5;
    }
    return courseRating;
  },
  set: (newRating) => {
    throw new Error("Property is readonly!");
  }
});

const dinnerDetailsParticipants = computed({
  get: () => {
    return dinnerDetails.value.data.participants.filter((participant) => participant.id !== dinnerDetails.value.data.ownerId);
  },
  set: (newParticipants) => {
    throw new Error("Property is readonly!");
  }
});

/**
 * Formats the date to be compatible with the input
 */
function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function deleteDinner() {
  dinnerStore.deleteDinner(dinnerId).then(() => {
    router.push("/dinner");
  });
}

function addParticipants(participants: UserId[]) {
  dinnerStore.addParticipants(dinnerId, participants);
}

function removeParticipant(participantId: UserId) {
  dinnerStore.removeParticipant(dinnerId, participantId);
}

function addCourse() {
  alert("Not implemented!");
}

function removeCourse(courseId: number) {
  alert("Not implemented!");
}

function showCourseDetails(courseId: number) {
  alert("Not implemented!");
}

// initialize the expanded panels
const expandedPanels = ref([
  "courses"
]);
if (expandAllCategories) {
  expandedPanels.value.push("metadata", "participants");
}

function updateDinnerDetails(focused: boolean) {
  if (!focused) {
    dinnerStore.updateDinnerDetails(dinnerId);
  }
}

</script>
<template>
  <div id="dinnerDetailContent">
    <div class="flexRow">
      <v-btn prepend-icon="mdi-chevron-left"
        @click="router.push('/dinner')">
        {{ t("dinnerDetail.back") }}
      </v-btn>
      <h1>{{ t("dinnerDetail.title") }}</h1>
    </div>
    <LoadingScreen :busy="dinnerDetails.loading"
      :success="dinnerDetails.success"
      class="category flexColumn">
      <template #success>
        <v-expansion-panels multiple
          v-model="expandedPanels">
          <v-expansion-panel value="metadata">
            <v-expansion-panel-title>
              <h2>{{ t("dinnerDetail.metadata") }}</h2>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-card class="category"
                variant="text">
                <v-card-text>
                  <v-text-field v-model="dinnerDetailsDate"
                    :label="t('dinnerDetail.metadata.date')"
                    type="date"
                    @update:focused="updateDinnerDetails">
                  </v-text-field>
                  <v-text-field v-model="dinnerDetails.data.title"
                    :label="t('dinnerDetail.metadata.title')"
                    @update:focused="updateDinnerDetails">
                  </v-text-field>
                </v-card-text>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel value="participants">
            <v-expansion-panel-title>
              <h2>{{ t("dinnerDetail.participants") }}</h2>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-card class="category"
                variant="text">
                <v-card-text>
                  <v-table>
                    <tbody>
                      <tr v-for="item in dinnerDetailsParticipants"
                        :key="item.id">
                        <td>{{ item.username }}</td>
                        <td>
                          <v-btn size="small"
                            density="comfortable"
                            :title="t('dinnerDetail.participants.remove')"
                            @click="removeParticipant(item.id)"
                            icon>
                            <v-icon color="error"
                              size="large">mdi-close-circle</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn ref="addParticipantButton"
                    color="primary">{{ t('dinnerDetail.participants.add') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-dialog :activator="addParticipantButton"
            max-width="340">
            <template v-slot:default="{ isActive }">
              <UserSelectionCard @close="isActive.value = false"
                @select="addParticipants" />
            </template>
          </v-dialog>

          <v-expansion-panel value="courses">
            <v-expansion-panel-title>
              <h2>{{ t("dinnerDetail.courses") }}</h2>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-card class="category"
                variant="text">
                <v-card-text>
                  <v-table>
                    <tbody>
                      <tr v-for="item in dinnerDetails.data.courses"
                        :key="item.id"
                        class="resetTableRowHeight flexRow">
                        <td class="courseRow">
                          <p class="courseTitle">{{ item.title }}</p>
                          <v-rating class="courseRating"
                            v-model="dinnerDetailsCourseRating[item.id]"
                            size="small"
                            active-color="orange-lighten-2"
                            color="orange"
                            dense
                            half-increments
                            readonly>
                          </v-rating>
                          <div class="courseActions flexRow">
                            <v-btn size="small"
                              density="comfortable"
                              :title="t('dinnerDetail.courses.more')"
                              icon
                              @click="showCourseDetails(item.id)">
                              <v-icon size=large>mdi-text-search</v-icon>
                            </v-btn>
                            <v-btn size="small"
                              density="comfortable"
                              :title="t('dinnerDetail.courses.remove')"
                              @click="removeCourse(item.id)"
                              icon>
                              <v-icon color="error"
                                size=large>mdi-trash-can-outline</v-icon>
                            </v-btn>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary"
                    @click="addCourse">{{ t('dinnerDetail.courses.add') }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </template>
      <template #error>
        <h2>{{ t("dinnerDetail.notFound") }}</h2>
      </template>
    </LoadingScreen>
    <footer>
      <v-btn :text="t('dinnerDetail.deleteDinner')"
        color="error"
        :disabled="dinnerDetails.loading || !dinnerDetails.success"
        @click="deleteDinner">
      </v-btn>
    </footer>
  </div>
</template>

<style scoped>
#dinnerDetailContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

#dinnerDetailContent>*:first-child,
#dinnerDetailContent>h1 {
  align-self: start;
}

#dinnerDetailContent>footer {
  align-self: start;
  margin: 1rem;
  /* align with card */
  margin-left: 0;
}

h1,
h2 {
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
}

.category {
  width: 100%;
}

.courseRow {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "title actions"
    "rating rating";
  align-items: center;
  margin-top: 0.2rem;
}

.courseTitle {
  grid-area: title;
}

.courseActions {
  grid-area: actions;
}

.courseRating {
  grid-area: rating;
}

#dinnerDetailContent .resetTableRowHeight>td {
  height: unset;
}
</style>
<style>
/* Fix: Labels cause overflow on small screens */
.courseRating span.v-rating__hidden {
  position: fixed;
}
</style>
