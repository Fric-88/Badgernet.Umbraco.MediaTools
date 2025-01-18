import {addPoints, Point, Zero} from "./point.ts";

export type ControlPoint = "overlay" |
                           "corner1" | 
                           "corner2" |
                           "corner3" | 
                           "corner4" | 
                           "leftSide" |
                           "rightSide" |
                           "topSide" |
                           "bottomSide" |
                           undefined ; 

export type DrawPoints = { topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point}
export class CropOverlay {
    
    readonly #controlRadius: number;
    
    #corner1: Point;
    #corner2: Point;
    #corner3: Point;
    #corner4: Point;
    #activeControl: ControlPoint;

    
    constructor(startPosition: Point, startSize:Point, controlDiameter?: number ) {
        
        if(!controlDiameter) controlDiameter = 6;
        
        this.#controlRadius = controlDiameter / 2;
        this.#corner1 = {x: startPosition.x, y: startPosition.y};
        this.#corner2 = {x: startPosition.x + startSize.x , y: startPosition.y};
        this.#corner4 = {x: startPosition.x + startSize.x , y: startPosition.y + startSize.y};
        this.#corner3 = {x: startPosition.x , y: startPosition.y + startSize.y};
       
    }
    public selectControl(pointerLocation: Point): void {
        
        
        if(this.#intersectsControl(this.#corner1, pointerLocation)) this.#activeControl = "corner1";
        else if(this.#intersectsControl(this.#corner2, pointerLocation)) this.#activeControl = "corner2";
        else if(this.#intersectsControl(this.#corner4, pointerLocation)) this.#activeControl = "corner3";
        else if(this.#intersectsControl(this.#corner3, pointerLocation)) this.#activeControl = "corner4";
        else if(this.#intersectsOverlay(pointerLocation)) this.#activeControl = "overlay";
        else
            this.#activeControl = undefined;
    }
    
    #center() : Point {
        return {
            x: this.#corner1.x + (this.#corner2.x - this.#corner1.x) / 2,
            y: this.#corner1.y + (this.#corner3.y - this.#corner1.y) / 2
        };
    }
    
    #width(): number {
        const sortedPoints = this.#sortCorners();
        return sortedPoints.topRight.x - sortedPoints.topLeft.x;
    }
    #height(): number {
        const sortedPoints = this.#sortCorners();
        return sortedPoints.bottomLeft.y - sortedPoints.topLeft.y;
    }
    
    public unselectControl(): void {
        this.#activeControl = undefined;
    }

    #intersectsOverlay(pointer: Point): boolean{
        
        const corners = this.#sortCorners();
        
        return pointer.x > corners.topLeft.x && pointer.x < corners.topRight.x && 
               pointer.y > corners.topLeft.y && pointer.y < corners.bottomLeft.y;    
    }
    #intersectsControl(controlCenter: Point, pointer: Point):boolean{
        
        return pointer.x > controlCenter.x - this.#controlRadius && pointer.x < controlCenter.x + this.#controlRadius && 
               pointer.y > controlCenter.y - this.#controlRadius && pointer.y < controlCenter.y + this.#controlRadius;
         
    }
    
    public moveActiveControl(moveAmount: Point){

        console.log("Moving: " + this.#activeControl + " x: " + moveAmount.x + " y: " + moveAmount.y);
        
        switch (this.#activeControl){
            case "overlay":
                this.#corner1 = addPoints(this.#corner1, moveAmount);
                this.#corner2 = addPoints(this.#corner2, moveAmount);
                this.#corner3 = addPoints(this.#corner3, moveAmount);
                this.#corner4 = addPoints(this.#corner4, moveAmount);
                break;
            case "corner1":
                this.#corner1 = addPoints(this.#corner1, moveAmount);
                this.#corner2.y = this.#corner1.y;
                this.#corner3.x = this.#corner1.x;
                break;
            case "corner2":
                this.#corner2 = addPoints(this.#corner2, moveAmount);
                this.#corner1.y = this.#corner2.y;
                this.#corner4.x = this.#corner2.x; 
                break;
            case "corner3":
                this.#corner4 = addPoints(this.#corner4, moveAmount);
                this.#corner2.x = this.#corner4.x;
                this.#corner3.y = this.#corner4.y;
                break;
            case "corner4":
                this.#corner3 = addPoints(this.#corner3, moveAmount);
                this.#corner1.x = this.#corner3.x;
                this.#corner4.y = this.#corner3.y;
                break;
            default: 
                return;
        }
    }

    #sortCorners(): { topLeft: Point; topRight: Point; bottomLeft: Point; bottomRight: Point } {
        // Put points into a temporary array to sort them
        const points = [this.#corner1, this.#corner2, this.#corner3, this.#corner4];

        // Sort points by y-coordinate first, then by x-coordinate
        points.sort((a, b) => a.y - b.y || a.x - b.x);

        // Top points are the first two, bottom points are the last two
        const [top1, top2, bottom1, bottom2] = points;

        // Determine left and right points
        const topLeft = top1.x < top2.x ? top1 : top2;
        const topRight = top1.x < top2.x ? top2 : top1;
        const bottomLeft = bottom1.x < bottom2.x ? bottom1 : bottom2;
        const bottomRight = bottom1.x < bottom2.x ? bottom2 : bottom1;

        return { topLeft, topRight, bottomLeft, bottomRight };
    }

    public getDrawPoints(): DrawPoints {
        
        return this.#sortCorners();
    }
    
    public getControlRadius(): number {
        return this.#controlRadius;
    }
} 


