export type Point = { x: number; y: number} 
export function addPoints(p1: Point, p2: Point): Point {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
export function subtractPoints(p1: Point, p2: Point ): Point {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
} 
export function Zero(): Point{
    return { x: 0, y: 0 };
} 



