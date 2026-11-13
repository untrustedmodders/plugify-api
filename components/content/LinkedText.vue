<script setup lang="ts">
import { itemGroups, useDocStore } from '~/lib/docStore';

// Text from a manifest (a description, a deprecation note) with the names of the manifest's
// methods, delegates, enums and classes linked to their pages, nested calls included:
// "Use A(B(handle)) instead" links both A and B
const props = defineProps<{
  text?: string;
  // The group to prefer when a name is in more than one
  group?: string;
  // A name never linked, e.g. the page's own
  self?: string;
  // The manifest; the open one if not given
  url?: string;
}>()

const store = useDocStore();

// Only names that read as code are linked, so a plain word (a method named "Free") stays text
const codeName = /[a-z][A-Z]|_|\d/;

const parts = computed(() => {
  const text = props.text ?? '';
  const doc = store.docs[props.url ?? store.selectedDocUrl];
  if (!doc) return [{ text }];
  const index = itemGroups(doc);
  // target: the item linked, which differs from the text for a listener
  const result: { text: string; target?: string; group?: string }[] = [];
  let last = 0;
  for (const match of text.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
    const name = match[0];
    if (name === props.self || !codeName.test(name)) continue;
    // A listener is written by its event name ("once OnClientInventoryLoaded fires"), which
    // is no item: link its callback, the signature a handler gets. An event is a name with
    // both X_Register and XCallback, so a word that only has a callback is left alone
    let target = name;
    let groups = index.get(name);
    if (!groups && index.has(`${name}_Register`)) {
      target = `${name}Callback`;
      groups = index.get(target);
    }
    if (!groups) continue;
    if (match.index > last) result.push({ text: text.slice(last, match.index) });
    result.push({ text: name, target, group: props.group && groups.includes(props.group) ? props.group : groups[0] });
    last = match.index + name.length;
  }
  if (last < text.length) result.push({ text: text.slice(last) });
  return result;
});
</script>

<template>
  <!-- One root element: a fragment root is easily lost track of when the text changes -->
  <span>
    <template v-for="(part, index) in parts" :key="index">
      <!-- Green with a dotted underline, like the linked types in signatures -->
      <a v-if="part.group" :href="`#/${part.group}/${part.target}`" :title="`Open ${part.target}`" class="font-mono font-semibold text-type underline decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid">{{ part.text }}</a>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>
