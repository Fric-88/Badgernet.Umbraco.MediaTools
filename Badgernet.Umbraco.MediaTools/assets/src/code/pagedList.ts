export class SelectablePagedList<T>{

    #arr: Array<T> = new Array<T>();
    #selection: Array<boolean> = new Array<boolean>();

    private _pageSize: number = 1;

    constructor(pageSize: number){
        this._pageSize = pageSize;
    }

    //Fills array from another array
    public fromArray(array: Array<T>): void{
        this.#arr = array;
        this.#selection = new Array(this.#arr.length).fill(false);
    }
    
    //Adds item to collection
    public add(item: T): void{
        this.#arr.push(item);
        this.#selection.push(false);
    }

    //Removes item from collection 
    public remove(item: T): void{
        if(this.#arr.includes(item)){
            let index = this.#arr.indexOf(item);
            this.#arr.splice(index,1);
            this.#selection.splice(index,1);
        } 
    }

    public replace(item: T, newItem: T){
        const index = this.indexOf(item);
        if(index >= 0){
            this.#arr[index] = newItem; 
        }
    }

    //Returns index of item or -1 if item does not exist 
    public indexOf(item: T): number{
        if(this.#arr.includes(item)){
            return this.#arr.indexOf(item);
        }
        return -1;
    }

    //Returns item at index or undefined if index out of bounds 
    public itemAt(index: number): T | undefined{
        if(index > this.#arr.length-1 || index < 0) return undefined;
        return this.#arr[index];
    }


    //Returns true if item is selected otherwise false
    public isSelected(item: T): boolean{
        let index = this.indexOf(item);
        if(index === undefined) return false; //Item not found 
        return this.#selection[index];
    }

    //Selects item
    public select(item: T){
        let index = this.indexOf(item);
        if(index === undefined) return; //Item not found
        this.#selection[index] = true; 
    } 

    //Unselects item 
    public unselect(item: T){
        let index = this.indexOf(item);
        if(index === undefined) return; //Item not found
        this.#selection[index] = false; 
    }

    //Toggles item selection
    public toggleSelection(item: T): void{
        let index = this.indexOf(item);
        if(index === undefined) return; //Item not found 
        this.#selection[index] = !this.#selection[index];
    }

    //Selects all items
    public selectAll(): void{
        this.#selection.fill(true);
    }

    //Unselects all items
    public unselectAll(): void{
        this.#selection.fill(false);
    }

    //Clears whole list
    public clear(): void{
        this.#arr = new Array<T>();
        this.#selection = new Array<boolean>();
    }

    //Items count
    public count(): number{
        return this.#arr.length;
    }

    //Pages count
    public countPages() : number{
        return Math.ceil(this.#arr.length / this._pageSize);
    }

    //Selected items count
    public countSelectedItems(): number{
        return this.getSelectedItems().length;
    }

    //Returns array of items on a page
    public getPage(pageNumber: number): Array<T>{

        if(pageNumber > this.countPages() || pageNumber < 1) return new Array<T>();

        let start = (pageNumber * this._pageSize) - this._pageSize;
        let stop = start + this._pageSize - 1; //Optimistic stop if page is full
        while(stop > this.#arr.length - 1){
            stop--; 
        }

        return this.#arr.slice(start,stop + 1);//+1 because stop is not included
    }

    //Returns selected items
    public getSelectedItems():Array<T>{
        return this.#arr.filter(item => this.isSelected(item));
    }


}