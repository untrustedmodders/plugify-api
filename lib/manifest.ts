export type ManifestType = {
    version?: string;
    name?: string;
    methods?: MethodType[];
    classes?: ClassType[];
    prototypes?: MethodType[];
    enums?: EnumType[];
}

export type BaseType = {
    name?: string;
    description?: string;
};

export type EnumValue = BaseType & {
    value?: bigint;
};

export type EnumType = BaseType & {
    values?: EnumValue[];
};

export type MethodType = BaseType & {
    group?: string;
    funcName?: string;
    paramTypes?: ParamType[];
    retType?: ParamType;
    error?: string;
};

export type ParamType = BaseType & {
    type?: string;
    ref?: boolean;
    prototype?: MethodType | string;
    enum?: EnumType | string;
};

export type AliasType = BaseType & {
    owner?: boolean;
};

export type BindingType = BaseType & {
    method?: string;
    paramAliases?: AliasType[];
    retAlias?: AliasType;
};

export type ClassType = BaseType & {
    group?: string;
    constructors?: string[];
    destructor?: string;
    bindings?: BindingType[]
    handleType?: string;
    invalidValue?: string;
}

export type MethodMap = Record<string, MethodType>;
export type EnumMap = Record<string, EnumType>;
export type ClassMap = Record<string, ClassType>;

/**
 * Links every by-name prototype/enum reference in a manifest to its definition,
 * and hoists inline definitions into the shared tables, so that afterwards every
 * `paramTypes`/`retType` entry carries a full object.
 *
 * Mirrors Manifest::Resolve in plugify core. Unlike the loader this is forgiving:
 * a reference that names nothing is left as it was rather than rejected, since a
 * viewer showing most of a page beats one showing an error.
 */
export function resolveManifest(manifest: ManifestType): ManifestType {
    const prototypes: MethodMap = {};
    const enums: EnumMap = {};

    for (const prototype of manifest.prototypes ?? []) {
        if (prototype.name) prototypes[prototype.name] = prototype;
    }
    for (const enumerator of manifest.enums ?? []) {
        if (enumerator.name) enums[enumerator.name] = enumerator;
    }

    // Pass one: collect the definitions written inline.
    const collect = (param: ParamType, seen: Set<MethodType>) => {
        const prototype = param.prototype;
        if (prototype && typeof prototype !== 'string' && prototype.name) {
            prototypes[prototype.name] ??= prototype;
            if (!seen.has(prototype)) {
                seen.add(prototype);
                for (const nested of prototype.paramTypes ?? []) collect(nested, seen);
                if (prototype.retType) collect(prototype.retType, seen);
            }
        }
        const enumerator = param.enum;
        if (enumerator && typeof enumerator !== 'string' && enumerator.name && enumerator.values?.length) {
            enums[enumerator.name] ??= enumerator;
        }
    };

    const seen = new Set<MethodType>();
    for (const method of manifest.methods ?? []) {
        for (const param of method.paramTypes ?? []) collect(param, seen);
        if (method.retType) collect(method.retType, seen);
    }
    for (const prototype of manifest.prototypes ?? []) {
        for (const param of prototype.paramTypes ?? []) collect(param, seen);
        if (prototype.retType) collect(prototype.retType, seen);
    }

    // Pass two: swap each reference for the definition it names. Every definition
    // is known by now, so references may point forwards.
    const link = (param: ParamType) => {
        if (typeof param.prototype === 'string') {
            param.prototype = prototypes[param.prototype] ?? param.prototype;
        }
        if (typeof param.enum === 'string') {
            param.enum = enums[param.enum] ?? param.enum;
        }
    };

    const linkOwner = (owner: MethodType) => {
        for (const param of owner.paramTypes ?? []) link(param);
        if (owner.retType) link(owner.retType);
    };

    for (const method of manifest.methods ?? []) linkOwner(method);
    for (const prototype of Object.values(prototypes)) linkOwner(prototype);

    manifest.prototypes = Object.keys(prototypes).sort().map(name => prototypes[name]);
    manifest.enums = Object.keys(enums).sort().map(name => enums[name]);
    return manifest;
}

/** Narrows a resolved prototype/enum field to its definition. */
export function definitionOf<T extends BaseType>(value: T | string | undefined): T | undefined {
    return typeof value === 'string' ? undefined : value;
}

