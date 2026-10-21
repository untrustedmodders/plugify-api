<script setup lang="ts">
import { docLink } from '~/lib/docStore';
import type { MethodType } from '~/lib/manifest';
import DocHeading from "~/components/content/DocHeading.vue";
import Parameter from "~/components/content/Parameter.vue";
import Signature from "~/components/content/Signature.vue";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  method: MethodType;
  group: string;
  url: string;
  kind?: string;
}>(), { kind: 'Method' })
// useRequestURL works on the server too, unlike window.location
const root = useRequestURL().origin;
</script>

<template>
  <article>
    <DocHeading
        :kind="kind"
        :title="method.name"
        :description="method.description"
        :link="docLink(root, url, `${group}/${method.name}`)"
    />
    <Alert v-if="method.deprecated" variant="destructive" class="mt-6">
      <TriangleAlert class="h-4 w-4" />
      <AlertTitle>Deprecated</AlertTitle>
      <AlertDescription>{{ method.deprecated }}</AlertDescription>
    </Alert>
    <div class="mt-6 overflow-x-auto rounded-lg border bg-card">
      <code class="block w-max min-w-full whitespace-pre p-4 font-mono text-sm">
        <span class="text-muted-foreground">native </span>
        <Signature :group="group" :param="method.retType"/>
        <span class="font-semibold">{{ method.name }}</span><span>(</span>
        <span v-if="method.paramTypes && method.paramTypes.length > 0">
          <span v-for="(param, index) in method.paramTypes" :key="index">
            <Signature :group="group" :param="param"/>
            <span v-if="method.paramTypes.length - 1 !== index">,&nbsp</span>
          </span>
        </span>
        <span>)</span>
      </code>
    </div>
    <section v-if="method.paramTypes && method.paramTypes.length > 0">
      <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Parameters</h2>
      <div class="divide-y rounded-lg border bg-card">
        <Parameter v-for="(param, index) in method.paramTypes" :key="index" :group="group" :param="param"/>
      </div>
    </section>
    <section v-if="method.retType && method.retType.type !== 'void'">
      <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Return</h2>
      <div class="rounded-lg border bg-card">
        <Parameter :group="group" :param="method.retType"/>
      </div>
    </section>
    <section v-if="method.error">
      <h2 class="mb-4 mt-10 scroll-m-20 border-b pb-2 text-xl font-semibold tracking-tight">Error</h2>
      <p class="text-muted-foreground">{{ method.error }}</p>
    </section>
  </article>
</template>
