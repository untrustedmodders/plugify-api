<script setup lang="ts">
import { computed } from "vue";
import {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Breadcrumb
} from '@/components/ui/breadcrumb'; // Adjust path as needed

// root: the manifest name, linking back to the home page
const props = defineProps<{ fragments: string[]; root?: string }>();

const breadcrumbs = computed(() => {
  const crumbs = (props.fragments || []).map((fragment, index) => ({
    name: fragment,
    path: `#/${props.fragments.slice(0, index + 1).join("/")}`,
    isLast: index === props.fragments.length - 1,
  }));
  return props.root ? [{ name: props.root, path: '#/', isLast: crumbs.length === 0 }, ...crumbs] : crumbs;
});
</script>

<template>
  <Breadcrumb>
    <BreadcrumbList v-if="breadcrumbs.length > 0">
      <template v-for="(breadcrumb, index) in breadcrumbs" :key="breadcrumb.path">
        <BreadcrumbItem>
          <template v-if="breadcrumb.isLast">
            <BreadcrumbPage>{{ breadcrumb.name }}</BreadcrumbPage>
          </template>
          <template v-else>
            <BreadcrumbLink :href="breadcrumb.path">
              {{ breadcrumb.name }}
            </BreadcrumbLink>
          </template>
        </BreadcrumbItem>
        <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" />
      </template>
    </BreadcrumbList>
  </Breadcrumb>
</template>
