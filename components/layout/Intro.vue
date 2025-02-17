<script setup lang="ts">
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Spinner from "~/components/layout/Spinner.vue";
import { onMounted, ref } from "vue";

const mounting = ref(true);

onMounted(() => {
  mounting.value = false;
})
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="mb-5">Plugify API Generator</CardTitle>
      <CardDescription>
        <template v-if="mounting">
          <Spinner />
        </template>
        <template v-else v-memo>
          <p class="mb-5">Search by name, parameter, or return type via the search bar above. Or click on each individual includes to inspect their contents.</p>
          <p class="mb-5">For additional information, visit the Plugify Scripting Wiki.</p>
          <p class="mb-5">For feedbacks regarding this site, visit discord.</p>
        </template>
      </CardDescription>
    </CardHeader>
  </Card>
</template>