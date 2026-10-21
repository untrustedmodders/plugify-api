import defaults from '~/manifests.json';

/** A manifest offered to every user, listed in manifests.json at the project root. */
export type DefaultManifest = {
    url: string;
    /** Shown instead of the manifest's own name; leave it out to use that one. */
    name?: string;
    description?: string;
    /** An iconify name, e.g. "lucide:gamepad-2". */
    icon?: string;
};

export const defaultManifests: DefaultManifest[] = defaults;

export function findDefaultManifest(url: string): DefaultManifest | undefined {
    return defaultManifests.find(manifest => manifest.url === url);
}
