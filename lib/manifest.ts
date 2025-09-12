export type ManifestType = {
    version?: string;
    name?: string;
    methods?: MethodType[];
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
    prototype?: MethodType;
    enum?: EnumType;
};

export type MethodMap = Record<string, MethodType>;
export type EnumMap = Record<string, EnumType>;
