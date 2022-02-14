interface Window {
    /**
     * Expose Environment versions.
     * @example
     * console.log( window.versions )
     */
    readonly versions: NodeJS.ProcessVersions;
    readonly api: { send: (channel: string, data?: unknown) => void; sendSync: (channel: string, data?: unknown) => void; receive: (channel: string, func: any) => void; store: { get(val: any): any; set(property: string, val: any): void; }; };
}
