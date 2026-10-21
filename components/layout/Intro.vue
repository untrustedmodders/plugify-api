<script setup lang="ts">
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

const { header } = useConfig().value;
const discord = header.links.find(link => link.icon.includes('discord'))?.to;
</script>

<template>
  <ClientOnly>
    <Card>
      <CardHeader>
        <CardTitle class="mb-5">Plugify API Generator</CardTitle>
        <CardDescription>
          <p class="mb-5">Search by name via the search bar above, or pick a group in the sidebar to inspect its contents.</p>
          <p class="mb-5">
            For additional information, visit the
            <a href="https://plugify.net/" target="_blank" class="text-primary hover:underline">Plugify documentation</a>.
          </p>
          <p v-if="discord" class="mb-5">
            For feedback regarding this site, visit our
            <a :href="discord" target="_blank" class="text-primary hover:underline">Discord</a>.
          </p>
        </CardDescription>
      </CardHeader>
    </Card>
  </ClientOnly>
</template>