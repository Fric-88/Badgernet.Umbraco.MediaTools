import {addPoints, Point, Zero} from "./point.ts";

export type ControlPoint = "overlay" |
                           "topLeft" | 
                           "topMiddle" | 
                           "topRight" |
                           "rightMiddle" | 
                           "bottomRight" | 
                           "bottomMiddle" |
                           "bottomLeft" | 
                           "leftMiddle" |
                           undefined ; 

export type DrawPoints = { topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point}
export class CropOverlay {
    
    readonly #controlRadius: number;
    
    #topLeft: Point;
    #topRight: Point;
    #bottomLeft: Point;
    #bottomRight: Point;
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
        
        if(this.#intersectsOverlay(pointerLocation)) this.#activeControl = "overlay";
        else if(this.#intersectsControl(this.#topLeft, pointerLocation)) this.#activeControl = "topLeft";
        else if(this.#intersectsControl(this.#topRight, pointerLocation)) this.#activeControl = "topRight";
        else if(this.#intersectsControl(this.#bottomRight, pointerLocation)) this.#activeControl = "bottomRight";
        else if(this.#intersectsControl(this.#bottomLeft, pointerLocation)) this.#activeControl = "bottomLeft";
        else
            this.#activeControl = undefined;
    }
    
    public unselectControl(): void {
        this.#activeControl = undefined;
    }

    #intersectsOverlay(pointer: Point): boolean{
        
        const overlayWidth = this.#topRight.x - this.#topLeft.x;
        const overlayHeight = this.#bottomLeft.y - this.#topLeft.y;
        
        const overlayCenter = { 
            x: this.#topLeft.x + overlayWidth / 2,
            y: this.#topLeft.y + overlayHeight / 2
        };  
        
        const xOffset = (Math.abs(overlayWidth) / 2) - this.#controlRadius; 
        const yOffset = (Math.abs(overlayHeight) / 2) - this.#controlRadius;
        
        return pointer.x > overlayCenter.x - xOffset  &&  pointer.y < overlayCenter.x + xOffset &&
               pointer.y > overlayCenter.y - yOffset &&  pointer.y < overlayCenter.y + yOffset;
    }
    #intersectsControl(controlCenter: Point, pointer: Point):boolean{
        
        return pointer.x > controlCenter.x - this.#controlRadius && pointer.x < controlCenter.x + this.#controlRadius && 
               pointer.y > controlCenter.y - this.#controlRadius && pointer.y < controlCenter.y + this.#controlRadius;
         
    }
    
    public moveActiveControl(moveAmount: Point){

        console.log("Moving: " + this.#activeControl + " x: " + moveAmount.x + " y: " + moveAmount.y);
        
        switch (this.#activeControl){
            case "overlay":
                this.#topLeft = addPoints(this.#topLeft, moveAmount);
                this.#topRight = addPoints(this.#topRight, moveAmount);
                this.#bottomLeft = addPoints(this.#bottomLeft, moveAmount);
                this.#bottomRight = addPoints(this.#bottomRight, moveAmount);
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

    public getDrawPoints(): DrawPoints {
        return {
            topLeft: this.#topLeft,
            topRight: this.#topRight,
            bottomRight: this.#bottomRight,
            bottomLeft: this.#bottomLeft,
        }
    }
    
    public getControlRadius(): number {
        return this.#controlRadius;
    }
} 


