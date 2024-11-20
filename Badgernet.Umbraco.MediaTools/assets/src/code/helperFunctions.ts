export function clampNumber(value: number, min: number, max: number): number{
    if(value > max) value = max;
    if(value < min) value = min;
    return value;
} 

export function isNumber(value: any): boolean {
    if (typeof value === 'number' && !isNaN(value)) {
        return true;
    }
    else if (typeof value === 'string' && value.trim() !== '') {
        return !isNaN(Number(value));
    }
    return false;
}

export function isString(value: any): boolean{
    return typeof value === "string";
}

export function isBool(value: any): boolean{
    return typeof value === "boolean"; 
} 

export function bytesToFileSize(bytes: number, si = false, dp = 1) : string{
    const threshold = si ? 1000 : 1024;

    if (Math.abs(bytes) < threshold) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= threshold;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= threshold && u < units.length - 1);
    return bytes.toFixed(dp) + ' ' + units[u];
}