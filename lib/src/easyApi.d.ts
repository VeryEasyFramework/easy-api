export declare class EasyApi {
    host: string;
    private notify;
    constructor(host?: string);
    call<T extends Record<string, any>>(group: string, action: string, data?: Record<string, any>): Promise<T>;
    private parseError;
    onNotify(callback: (info: {
        message: string;
        title: string;
        type: string;
    }) => void): void;
}
//# sourceMappingURL=easyApi.d.ts.map