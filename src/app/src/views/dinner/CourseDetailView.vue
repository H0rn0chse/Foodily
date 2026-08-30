<script setup lang="ts">
import { useDinnerStore } from "@/stores/dinner";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import LoadingScreen from "@/components/LoadingScreen.vue";
import { parseParams } from "../../router";
import { useDialogStore } from "@/stores/dialog";
const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const dinnerId = parseParams(route, "dinnerId");
const courseId = parseParams(route, "courseId");

const dialogStore = useDialogStore();

const dinnerStore = useDinnerStore();
const dinnerDetails = dinnerStore.dinnerDetails.get(dinnerId);

onMounted(() => {
  dinnerDetails.load();
});

const courseFound = computed(() => {
  return !!dinnerDetails.data.courses.find((course) => course.id === courseId);
});

const courseModel = computed({
  get: () => {
    const details = dinnerDetails.data.courses.find(
      (course) => course.id === courseId,
    );

    return {
      title: details?.title,
      description: details?.description,
      type: details?.type,
      vegetarian: details?.vegetarian,
      vegan: details?.vegan,
    };
  },
  set: (newCourse) => {
    courseModel.value = newCourse;
  },
});

const rating = ref(0);

async function updateCourseDetailsOnFocusOut(focused: boolean | string | null) {
  if (focused) {
    return;
  }

  await dinnerStore.updateCourse(dinnerId, courseId, {
    title: courseModel.value.title,
    description: courseModel.value.description,
    type: courseModel.value.type,
    vegetarian: courseModel.value.vegetarian,
    vegan: courseModel.value.vegan,
  });
  await dinnerDetails.load();
}

async function updateCourseDetails() {
  await dinnerStore.updateCourse(dinnerId, courseId, {
    title: courseModel.value.title,
    description: courseModel.value.description,
    type: courseModel.value.type,
    vegetarian: courseModel.value.vegetarian,
    vegan: courseModel.value.vegan,
  });
  await dinnerDetails.load();
}

function deleteCourse() {
  dialogStore.open(async () => {
    await dinnerStore.deleteCourse(dinnerId, courseId);
    router.push(`/dinner/${dinnerId}`);
  });
}

const typeItems = [
  { title: t("courseDetail.metadata.type.starter"), value: "starter" },
  { title: t("courseDetail.metadata.type.main"), value: "main" },
  { title: t("courseDetail.metadata.type.dessert"), value: "dessert" },
];
</script>
<template>
  <div id="courseDetailContent">
    <div class="flexRow">
      <v-btn
        prepend-icon="mdi-chevron-left"
        @click="router.push(`/dinner/${dinnerId}`)"
      >
        {{ t("courseDetail.back") }}
      </v-btn>
      <h1>{{ t("courseDetail.title") }}</h1>
    </div>
    <LoadingScreen
      :busy="dinnerDetails.loading"
      :success="!dinnerDetails.error && courseFound"
      class="flexColumn w-100"
    >
      <template #success>
        <v-card class="w-100">
          <v-card-text>
            <div class="form flexColumn">
              <v-text-field
                v-model="courseModel.title"
                :label="t('courseDetail.metadata.title')"
                @update:focused="updateCourseDetailsOnFocusOut"
              />
              <v-text-field
                v-model="courseModel.description"
                :label="t('courseDetail.metadata.description')"
                @update:focused="updateCourseDetailsOnFocusOut"
              />
              <v-select
                v-model="courseModel.type"
                :items="typeItems"
                :label="t('courseDetail.metadata.type')"
                @update:model-value="updateCourseDetails"
              />
              <v-switch
                v-model="courseModel.vegetarian"
                :label="t('courseDetail.metadata.vegetarian')"
                color="primary"
                @update:model-value="updateCourseDetails"
              />
              <v-switch
                v-model="courseModel.vegan"
                :label="t('courseDetail.metadata.vegan')"
                color="primary"
                @update:model-value="updateCourseDetails"
              />
              <div class="flexRow">
                <div class="text-h5 courseRating">
                  {{ rating }}
                  <span class="text-subtitle-1 ml-n1">/5</span>
                </div>
                <v-slider
                  v-model="rating"
                  step="0.25"
                  max="5"
                  thumb-label
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </template>
      <template #error>
        <h2>{{ t("courseDetail.notFound") }}</h2>
      </template>
    </LoadingScreen>
    <footer>
      <v-btn
        :text="t('courseDetail.deleteCourse')"
        color="error"
        :disabled="dinnerDetails.loading || dinnerDetails.error"
        @click="deleteCourse"
      />
    </footer>
  </div>
</template>

<style scoped>
#courseDetailContent {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

#courseDetailContent > *:first-child,
#courseDetailContent > h1 {
  align-self: start;
}

#courseDetailContent > footer {
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

.form > * {
  width: 100%;
}

.courseRating {
  min-width: 4rem;
}
</style>
