export class Point{
    
    #x: number= 0;
    #y: number= 0;
    
    constructor(x:number = 0, y:number = 0) {
        this.#x = x;
        this.#y = y;
    }
    set x(value:number) {
        this.#x = value;
    }
    get x(): number{
        return this.#x;
    }
    set y(value:number) {
        this.#y = value;
    }
    get y():number{
        return this.#y;
    }
} 