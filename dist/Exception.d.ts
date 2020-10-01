interface ConfigOptions {
    displayCodes?: boolean;
    displayReferences?: boolean;
}
export declare const config: ConfigOptions;
export declare class Exception {
    header: string;
    __data: {
        at: {
            [key: string]: Exception;
        };
        nest: Exception[];
        message: Array<string>;
    };
    constructor(header: string);
    at(key: string | number): Exception;
    get count(): number;
    get hasException(): boolean;
    message(message: string, code: string, reference?: string): Exception;
    nest(header: string): Exception;
    push(exception: Exception): Exception;
    toString(): string;
}
export {};
