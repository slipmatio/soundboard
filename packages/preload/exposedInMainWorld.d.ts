interface Window {
    /**
     * Expose Environment versions.
     * @example
     * console.log( window.versions )
     */
    readonly versions: NodeJS.ProcessVersions;
    /**
     * Safe expose node.js API
     * @example
     * window.nodeCrypto('data')
     */
    readonly nodeCrypto: { sha256sum(data: import("crypto").BinaryLike): string; };
    readonly api: { send: (channel: string, data: unknown) => void; sendSync: (channel: string, data: unknown) => void; receive: (channel: string, func: any) => void; };
}
