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

function formatUrl(url: string) {
    // Handle GitHub URLs
    if (url.includes('://github.com')) {
        return url
            .replace('://github.com', '://raw.githubusercontent.com')
            .replace('/blob/', '/');
    }

    // Handle GitLab URLs
    if (url.includes('://gitlab.com')) {
        return url.replace('/-/blob/', '/-/raw/');
    }

    // Handle self-hosted GitLab instances (common pattern: gitlab.domain.com)
    if (url.match(/:\/\/gitlab\.[^/]+/) && url.includes('/-/blob/')) {
        return url.replace('/-/blob/', '/-/raw/');
    }

    return url;
}

// Turns a user-supplied link into the raw manifest URL, or null if it is not http(s)
export function normalizeDocUrl(url: string): string | null {
    try {
        const u = new URL(formatUrl(url));
        if (u.protocol === "http:" || u.protocol === "https:") {
            return u.href;
        }
    } catch (error) {
        console.error('Invalid url:', error);
    }
    return null;
}

// Links in manifests.json may be GitHub/GitLab page links; store them the way the site
// keeps every manifest URL, or they would not match and show up as extra custom APIs
export const defaultManifests: DefaultManifest[] = (defaults as DefaultManifest[])
    .map(manifest => ({ ...manifest, url: normalizeDocUrl(manifest.url) ?? manifest.url }));

export function findDefaultManifest(url: string): DefaultManifest | undefined {
    return defaultManifests.find(manifest => manifest.url === url);
}
