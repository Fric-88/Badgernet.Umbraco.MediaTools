import {ImageDataList} from "./imageDataList.ts";
import {Vector} from "./vector.ts";


export class Canvas {
    
    #imageUrl: string = "";
    #canvas: HTMLCanvasElement;
    #backCanvas?: OffscreenCanvas;
    #imageDataList: ImageDataList;
    
    readonly #context: CanvasRenderingContext2D | null;
    #offscreenContext?: OffscreenCanvasRenderingContext2D | null;

    constructor(canvas: HTMLCanvasElement){
        this.#canvas = canvas;
        this.#context = this.#canvas.getContext("2d");
        this.#imageDataList = new ImageDataList(50);
    }
    
    private get backContext(){
        return this.#offscreenContext;
    }
    private get frontContext(){
        return this.#context;
    }
    
    //Loads the initial image from URL
    public async loadImage(imageUrl: string): Promise<boolean> {

        return new Promise((resolve, reject) => {
            
            this.#imageUrl = imageUrl;
            let tempImgElement = new Image();
            tempImgElement.src = imageUrl;
            tempImgElement.onload = () => {
                this.#backCanvas = new OffscreenCanvas(tempImgElement.naturalWidth, tempImgElement.naturalHeight);
                
                this.#offscreenContext = this.#backCanvas?.getContext("2d", {willReadFrequently: true});

                let ctx = this.backContext;
                if(!ctx) {
                    reject(new Error("Failed to get offscreen canvas context."));
                    return;
                }
                ctx.drawImage(tempImgElement, 0, 0);
                this.#imageDataList.addNew(ctx.getImageData(0,0,tempImgElement.naturalWidth, tempImgElement.naturalHeight));
                resolve(true);
            }

            tempImgElement.onerror = () => {
                reject(new Error("Failed to load the image."));
            }
        });
    }
    
    //Renders contents of the backCanvas on the frontCanvas
    public renderFrontCanvas(): void{
        if (!this.#backCanvas) return;
        const ctx = this.#canvas.getContext("2d");
        if (!ctx) return;
        
        const canvasWidth = this.#canvas.width;
        const canvasHeight = this.#canvas.height;
        
        const image = this.#imageDataList.getImageData();
        
        const CANVAS_PADDING = 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Recalculate draw size and draw target
        const drawSize = { x: image.width, y: image.height };
        const drawTarget = { x: 0, y: 0 };

        // Calculate aspect ratio
        const imageAspectRatio = image.width / image.height;

        // Scale down if image is larger than canvas with padding
        if (image.width > canvasWidth - CANVAS_PADDING * 2 || image.height > canvasHeight - CANVAS_PADDING * 2) {

            // Wider than taller
            if (imageAspectRatio > 1) {
                drawSize.x = canvasWidth - CANVAS_PADDING * 2;
                drawSize.y = drawSize.x / imageAspectRatio;

                // Adjust if height exceeds canvas (when resizing)
                if (drawSize.y > canvasHeight - CANVAS_PADDING * 2) {
                    drawSize.y = canvasHeight - CANVAS_PADDING * 2;
                    drawSize.x = drawSize.y * imageAspectRatio;
                }
            } 
            else { // Taller than wider 
                drawSize.y = canvasHeight - CANVAS_PADDING * 2;
                drawSize.x = drawSize.y * imageAspectRatio;

                // Adjust if width exceeds canvas
                if (drawSize.x > canvasWidth - CANVAS_PADDING * 2) {
                    drawSize.x = canvasWidth - CANVAS_PADDING * 2;
                    drawSize.y = drawSize.x / imageAspectRatio;
                }
            }
        }

        // Center the image on the canvas
        drawTarget.x = (canvasWidth - drawSize.x) / 2;
        drawTarget.y = (canvasHeight - drawSize.y) / 2;

        // Draw image
        ctx.drawImage(
            this.#backCanvas,
            0, 0, image.width, image.height,
            drawTarget.x, drawTarget.y, drawSize.x, drawSize.y
        );
        

        //Debug draw
        ctx.fillText("B canvas size: " + this.#backCanvas.width + " x " + this.#backCanvas.height, 5,10);
        ctx.fillText("F canvas size: " + this.#canvas.width + " x " + this.#canvas.height, 5,20);
        ctx.fillText("Image size   : " + image.width + " x " + image.height, 5,30);
        ctx.fillText("Draw size: " + drawSize.x + " x " + drawSize.y, 5,40);
        ctx.fillText("Draw target  : " + drawTarget.x + " - " + drawTarget.y, 5,50);
        ctx.fillText("History  : " + this.#imageDataList.length, 5,60);
        ctx.fillText("History index  : " + this.#imageDataList.currentIndex, 5,70);
        
    } 
    
    #saveChanges():void{
        if (!this.#backCanvas) return;

        const ctx = this.backContext;
        if (!ctx) return;
        this.#imageDataList.addNew(ctx.getImageData(0, 0, this.#backCanvas.width, this.#backCanvas.height));
    }

    public flipVertically():void{
        if (!this.#backCanvas) return;

        const ctx = this.backContext;
        if (!ctx) return;

        let temp = this.#backCanvas.transferToImageBitmap();

        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);
        ctx.scale(-1, 1);
        ctx.drawImage(temp, -temp.width,0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        temp.close();
        
        this.#saveChanges();
        this.renderFrontCanvas();
    }

    public flipHorizontally():void{
        if (!this.#backCanvas) return;

        this.#saveChanges();
        
        const ctx = this.backContext;
        if (!ctx) return;

        let temp = this.#backCanvas.transferToImageBitmap();

        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(temp, 0, -temp.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        temp.close();

        this.#saveChanges();
        this.renderFrontCanvas();
    }
    

    //Changes brightness, contrast, exposure of the image on backCanvas   
    public changeBCEValues(brightness: number, contrast: number, exposure: number): void{
        if (!this.#backCanvas) return;
        const ctx = this.backContext
        if (!ctx) return;

        //Need to work with a copy of the unedited image to prevent stacking of the adjustments
        const image = this.#imageDataList.getCopy();
        
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast)); // Contrast factor
        
        for(let i= 0; i < image.data.length; i+= 4){
            for(let j = 0; j < 3; j ++ ){

                let value = image.data[i + j] + brightness;
                value = factor * (value - 128) + 128;
                value = value * exposure;
                image.data[i + j] = value;
            }
        }
        
        ctx.putImageData(image, 0, 0);
        this.renderFrontCanvas();
    }
    
    
    //Saves backCanvas and re-renders frontCanvas 
    public applyChanges(){
        this.#saveChanges();
        this.renderFrontCanvas();
    }
    
    public undoChanges(){
        if (!this.#backCanvas) return;
        
        this.#imageDataList.goBack();
        const img = this.#imageDataList.getImageData();

        const ctx = this.backContext;
        if (!ctx) return;
        
        //Clear back canvas
        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);    
        
        //Resize to fit the image from history 
        this.#backCanvas.width = img.width;
        this.#backCanvas.height = img.height;
        
        ctx.putImageData(img, 0, 0);
        
        this.renderFrontCanvas();
       
    }
    
    public redoChanges(){
        if (!this.#backCanvas) return;

        this.#imageDataList.goForward();
        const img = this.#imageDataList.getImageData();

        const ctx = this.backContext;
        if (!ctx) return;

        //Clear back canvas
        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);

        //Resize to fit the image from history 
        this.#backCanvas.width = img.width;
        this.#backCanvas.height = img.height;

        ctx.putImageData(img, 0, 0);

        this.renderFrontCanvas();
    }

    
} 