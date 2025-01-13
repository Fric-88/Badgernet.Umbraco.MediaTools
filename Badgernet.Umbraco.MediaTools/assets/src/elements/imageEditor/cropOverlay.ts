import {addPoints, Point} from "./point.ts";

export type ControlPoint = "topLeft" | 
                           "topMiddle" | 
                           "topRight" |
                           "rightMiddle" | 
                           "bottomRight" | 
                           "bottomMiddle" |
                           "bottomLeft" | 
                           "leftMiddle"; 

export type DrawPoints = { topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point}
export class CropOverlay {
    
    readonly #controlRadius: number;
    
    #topLeft: Point;
    //#topMiddle: Point;
    #topRight: Point;
    //#rightMiddle: Point;
    #bottomLeft: Point;
    //#bottomMiddle: Point;
    #bottomRight: Point;
    //#leftMiddle: Point;

    
    constructor(startPosition: Point, startSize:Point, controlDiameter?: number ) {
        
        if(!controlDiameter) controlDiameter = 6;
        
        this.#controlRadius = controlDiameter / 2;
        this.#topLeft = {x: startPosition.x, y: startPosition.y};
        //this.#topMiddle = {x: startPosition.x + startSize.x / 2 , y: startPosition.y};
        this.#topRight = {x: startPosition.x + startSize.x , y: startPosition.y};
        //this.#rightMiddle = {x: startPosition.x + startSize.x , y: startPosition.y + startSize.y / 2};
        this.#bottomRight = {x: startPosition.x + startSize.x , y: startPosition.y + startSize.y};
        //this.#bottomMiddle = {x: startPosition.x + startSize.x / 2 , y: startPosition.y + startSize.y};
        this.#bottomLeft = {x: startPosition.x , y: startPosition.y + startSize.y};
        //this.#leftMiddle = {x: startPosition.x , y: startPosition.y + startSize.y / 2};
        
    }
    
    public getIntersectingControl(pointerLocation: Point): ControlPoint | undefined  {
        
        if(this.#intersectsSquare(this.#topLeft, pointerLocation)) return "topLeft";
        //else if(this.#intersectsSquare(this.#topMiddle, pointerLocation)) return "topMiddle";
        else if(this.#intersectsSquare(this.#topRight, pointerLocation)) return "topRight";
        //else if(this.#intersectsSquare(this.#rightMiddle, pointerLocation)) return "rightMiddle";
        else if(this.#intersectsSquare(this.#bottomRight, pointerLocation)) return "bottomRight";
        //else if(this.#intersectsSquare(this.#bottomMiddle, pointerLocation)) return "bottomMiddle";
        else if(this.#intersectsSquare(this.#bottomLeft, pointerLocation)) return "bottomLeft";
        //else if(this.#intersectsSquare(this.#leftMiddle, pointerLocation)) return "leftMiddle";
        else 
            return undefined;
        
    }

    #intersectsSquare(squareCenter: Point, pointer: Point):boolean{
        
        return pointer.x > squareCenter.x - this.#controlRadius && pointer.x < squareCenter.x + this.#controlRadius && 
               pointer.y > squareCenter.y - this.#controlRadius && pointer.y < squareCenter.y + this.#controlRadius;
         
    }
    
    public moveControl(control: ControlPoint, moveAmount: Point){
        
        switch (control){
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


