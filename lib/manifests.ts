import defaults from '~/manifests.json';
import community from '~/manifests.community.json';

/**
 * A manifest listed on the site: manifests.json holds the official ones, offered to
 * every user, manifests.community.json the ones made by the community.
 */
export type DefaultManifest = {
    url: string;
    /** The manifest's address on the site, e.g. "s2sdk" for /s2sdk. */
    slug: string;
    /** Shown instead of the manifest's own name; leave it out to use that one. */
    name?: string;
    description?: string;
    /** An iconify name, e.g. "lucide:gamepad-2". */
    icon?: string;
    /** Who made it, shown on community cards. */
    author?: string;
    /** Set for the manifests.community.json ones. */
    community?: boolean;
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

// Manifests opened from the user's disk are listed as "local:<file name>"
const LOCAL_PREFIX = 'local:';

export function isLocalDoc(url: string) {
    return url.startsWith(LOCAL_PREFIX);
}

export function localDocUrl(fileName: string) {
    return LOCAL_PREFIX + fileName;
}

/** The file name of a manifest opened from disk. */
export function localFileName(url: string) {
    return url.slice(LOCAL_PREFIX.length);
}

/** Where a manifest comes from, shown under its name: its link, or the file it was opened from. */
export function manifestSource(url: string) {
    return isLocalDoc(url) ? `Local file: ${localFileName(url)}` : url;
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

// Links in the lists may be GitHub/GitLab page links; store them the way the site
// keeps every manifest URL, or they would not match and show up as extra custom APIs
function listed(manifests: DefaultManifest[], community: boolean): DefaultManifest[] {
    return manifests.map(manifest => ({ ...manifest, community, url: normalizeDocUrl(manifest.url) ?? manifest.url }));
}

export const defaultManifests = listed(defaults as DefaultManifest[], false);
export const communityManifests = listed(community as DefaultManifest[], true);

const listedManifests = [...defaultManifests, ...communityManifests];

/** The listed manifest (official or community) with this URL. */
export function findDefaultManifest(url: string): DefaultManifest | undefined {
    return listedManifests.find(manifest => manifest.url === url);
}

/**
 * Whether two links name the same file. raw.githubusercontent.com takes a branch both as
 * "main" and as "refs/heads/main"; a trailing slash does not matter either.
 */
export function sameManifestUrl(a: string, b: string) {
    const key = (url: string) => url.replace('/refs/heads/', '/').replace(/\/$/, '');
    return key(a) === key(b);
}

/** The listed manifest (official or community) behind a link, however it is written. */
export function findListedManifest(url: string): DefaultManifest | undefined {
    return listedManifests.find(manifest => sameManifestUrl(manifest.url, url));
}

/**
 * The repository page of a listed (official or community) manifest, read from its link:
 * raw.githubusercontent.com/<owner>/<repo>/... on GitHub, .../-/raw/... on GitLab. A
 * manifest hosted anywhere else has none.
 */
export function manifestRepository(url: string): string | undefined {
    if (!findDefaultManifest(url)) return undefined;
    try {
        const u = new URL(url);
        if (u.hostname === 'raw.githubusercontent.com') {
            const [owner, repo] = u.pathname.split('/').filter(Boolean);
            return owner && repo ? `https://github.com/${owner}/${repo}` : undefined;
        }
        const raw = u.pathname.indexOf('/-/raw/');
        if (raw > 0) return `${u.origin}${u.pathname.slice(0, raw)}`;
    } catch {
        // not a URL: no repository
    }
    return undefined;
}

export function findManifestBySlug(slug: string): DefaultManifest | undefined {
    return slug ? listedManifests.find(manifest => manifest.slug === slug) : undefined;
}

/** The first segment of a path: "s2sdk" for /s2sdk, /s2sdk/ and /s2sdk.html. */
export function slugFromPath(path: string) {
    return (path.split('/').find(segment => segment.length > 0) ?? '').replace(/\.html$/, '');
}

/**
 * Where a manifest's pages live: a listed one has an address of its own, which is also a
 * prerendered page with the manifest's name and description for link previews; any other
 * manifest is shown on / and named by ?file=.
 */
export function manifestPath(url: string) {
    const manifest = findDefaultManifest(url);
    return manifest ? `/${manifest.slug}` : '/';
}
