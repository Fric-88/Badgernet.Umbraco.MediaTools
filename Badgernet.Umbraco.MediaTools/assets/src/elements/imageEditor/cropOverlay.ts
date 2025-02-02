import {addPoints, Point, Zero} from "./point.ts";

export type ControlPoint = "overlay" |
                           "topLeft" | 
                           "topRight" |
                           "bottomRight" | 
                           "bottomLeft" | 
                           "leftSide" |
                           "rightSide" |
                           "topSide" |
                           "bottomSide" |
                           undefined ; 

export type DrawPoints = { topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point}
export class CropOverlay {
    
    readonly #controlRadius: number;
    
    #topLeft: Point;
    #topRight: Point;
    #bottomRight: Point;
    #bottomLeft: Point;
    #activeControl: ControlPoint;

    constructor(startPosition: Point, startSize:Point, controlDiameter?: number ) {
        
        if(!controlDiameter) controlDiameter = 6;
        
        this.#controlRadius = controlDiameter / 2;
        this.#topLeft = {x: startPosition.x, y: startPosition.y};
        this.#topRight = {x: startPosition.x + startSize.x , y: startPosition.y};
        this.#bottomRight = {x: startPosition.x + startSize.x , y: startPosition.y + startSize.y};
        this.#bottomLeft = {x: startPosition.x , y: startPosition.y + startSize.y};
       
    }
    public selectControl(pointerLocation: Point): void {
        if(this.#intersectsControl(this.#topLeft, pointerLocation)) this.#activeControl = "topLeft";
        else if(this.#intersectsControl(this.#topRight, pointerLocation)) this.#activeControl = "topRight";
        else if(this.#intersectsControl(this.#bottomRight, pointerLocation)) this.#activeControl = "bottomRight";
        else if(this.#intersectsControl(this.#bottomLeft, pointerLocation)) this.#activeControl = "bottomLeft";
        else if(this.#intersectsOverlay(pointerLocation)) this.#activeControl = "overlay";
        else
            this.#activeControl = undefined;
    }
    public unselectControl(): void {
        this.#activeControl = undefined;
        this.#sortCorners();
    }
    #intersectsOverlay(pointer: Point): boolean{
        
        const corners = this.getDrawPoints();
        
        return pointer.x > corners.topLeft.x && pointer.x < corners.topRight.x && 
               pointer.y > corners.topLeft.y && pointer.y < corners.bottomRight.y;    
    }
    #intersectsControl(controlCenter: Point, pointer: Point):boolean{
        
        return pointer.x > controlCenter.x - this.#controlRadius && pointer.x < controlCenter.x + this.#controlRadius && 
               pointer.y > controlCenter.y - this.#controlRadius && pointer.y < controlCenter.y + this.#controlRadius;
         
    }
    
    public moveActiveControl(moveAmount: Point){

        switch (this.#activeControl){
            case "overlay":
                this.moveOverlay(moveAmount);
                break;
            case "topLeft":
                this.#topLeft = addPoints(this.#topLeft, moveAmount);
                this.#topRight.y = this.#topLeft.y;
                this.#bottomLeft.x = this.#topLeft.x;
                break;
            case "topRight":
                this.#topRight = addPoints(this.#topRight, moveAmount);
                this.#topLeft.y = this.#topRight.y;
                this.#bottomRight.x = this.#topRight.x; 
                break;
            case "bottomRight":
                this.#bottomRight = addPoints(this.#bottomRight, moveAmount);
                this.#topRight.x = this.#bottomRight.x;
                this.#bottomLeft.y = this.#bottomRight.y;
                break;
            case "bottomLeft":
                this.#bottomLeft = addPoints(this.#bottomLeft, moveAmount);
                this.#topLeft.x = this.#bottomLeft.x;
                this.#bottomRight.y = this.#bottomLeft.y;
                break;
            default: 
                return;
        }
    }
    
    public moveOverlay(moveAmount: Point){
        this.#topLeft = addPoints(this.#topLeft, moveAmount);
        this.#topRight = addPoints(this.#topRight, moveAmount);
        this.#bottomRight = addPoints(this.#bottomRight, moveAmount);
        this.#bottomLeft = addPoints(this.#bottomLeft, moveAmount);
    }

    public scaleOverlay(xRatio:number, yRatio:number){
        this.#topLeft.x *= xRatio;
        this.#topLeft.y *= yRatio;
        this.#topRight.x *= xRatio;
        this.#topRight.y *= yRatio;
        this.#bottomLeft.x *= xRatio;
        this.#bottomLeft.y *= yRatio;
        this.#bottomRight.x *= xRatio;
        this.#bottomRight.y *= yRatio;
    }
    
    #sortCorners(): void {
        // Copy points into a temporary array to sort them
        const pointsCopy: Point[] = [
            {x: this.#topLeft.x, y: this.#topLeft.y},
            {x: this.#topRight.x, y: this.#topRight.y},
            {x: this.#bottomLeft.x, y: this.#bottomLeft.y},
            {x: this.#bottomRight.x, y: this.#bottomRight.y}
        ];
    
        // Sort points by y-coordinate first, then by x-coordinate
        pointsCopy.sort((a, b) => a.y - b.y || a.x - b.x);

        // Top points are the first two, bottom points are the last two
        const [top1, top2, bottom1, bottom2] = pointsCopy; 

        // Determine left and right points
        this.#topLeft = top1.x < top2.x ? top1 : top2;
        this.#topRight = top1.x < top2.x ? top2 : top1;
        this.#bottomLeft = bottom1.x < bottom2.x ? bottom1 : bottom2;
        this.#bottomRight = bottom1.x < bottom2.x ? bottom2 : bottom1;
    }

    public getDrawPoints(): DrawPoints {
        
        return { 
            topLeft: this.#topLeft,
            topRight: this.#topRight,
            bottomRight: this.#bottomRight,
            bottomLeft: this.#bottomLeft
        }
    }
    
    public getControlRadius(): number {
        return this.#controlRadius;
    }
} 


