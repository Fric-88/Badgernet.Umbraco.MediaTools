import {EditableImage} from "./editableImage.ts";
import {Vector} from "./vector.ts";


export class Canvas {
    
    #imageUrl: string = "";
    #canvas: HTMLCanvasElement;
    #backCanvas?: OffscreenCanvas;
    #history: Array<ImageData>;
    #image: EditableImage 

    constructor(canvas: HTMLCanvasElement){
        this.#canvas = canvas;
        this.#history = new Array<ImageData>();
        this.#image = new EditableImage();
    }
    public async loadImage(imageUrl: string): Promise<boolean> {
        this.#imageUrl = imageUrl;
        this.#image = new EditableImage();
        let imageLoaded = await this.#image.loadImage(imageUrl);
        
        if(imageLoaded){
            this.#backCanvas = new OffscreenCanvas(this.#image.imageData!.width, this.#image.height);
            let ctx = this.#backCanvas.getContext("2d");
            if(ctx){
                ctx.putImageData(this.#image.imageData!, 0, 0); //Draw image on back canvas 
            }
            return true;
        }
        else{
            return false;
        }
    }
    public renderCanvas(): void{
        if (!this.#backCanvas || !this.#image.imageData) return;

        const ctx = this.#canvas.getContext("2d");
        if (!ctx) return;
        
        const canvasWidth = this.#canvas.width;
        const canvasHeight = this.#canvas.height;
        
        const imageWidth = this.#image.width;
        const imageHeight = this.#image.height;   
        
        const CANVAS_PADDING = 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Initialize draw size and target
        const drawSize = { x: imageWidth, y: imageHeight };
        const drawTarget = { x: 0, y: 0 };

        // Calculate aspect ratio
        const imageAspectRatio = imageWidth / imageHeight;

        // Scale down if image is larger than canvas with padding
        if (imageWidth > canvasWidth - CANVAS_PADDING * 2 || imageHeight > canvasHeight - CANVAS_PADDING * 2) {

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
            0, 0, imageWidth, imageHeight,
            drawTarget.x, drawTarget.y, drawSize.x, drawSize.y
        );
        

        //Debug draw
        ctx.fillText("B canvas size: " + this.#backCanvas.width + " x " + this.#backCanvas.height, 5,10);
        ctx.fillText("F canvas size: " + this.#canvas.width + " x " + this.#canvas.height, 5,20);
        ctx.fillText("Image size   : " + this.#image.width + " x " + this.#image.height, 5,30);
        ctx.fillText("Draw size: " + drawSize.x + " x " + drawSize.y, 5,40);
        ctx.fillText("Draw target  : " + drawTarget.x + " - " + drawTarget.y, 5,50);
        ctx.fillText("History  : " + this.#history.length, 5,60);
        
    } 
    
    #saveToHistory():void{
        if (!this.#backCanvas) return;

        const ctx = this.#backCanvas.getContext("2d");
        if (!ctx) return;
        this.#history.push(ctx.getImageData(0, 0, this.#backCanvas.width, this.#backCanvas.height));
        
    }

    public flipVertically():void{
        if (!this.#backCanvas || !this.#image.imageData) return;

        const ctx = this.#backCanvas.getContext("2d");
        if (!ctx) return;
        
        this.#saveToHistory();
        
        let temp = this.#backCanvas.transferToImageBitmap();

        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);
        ctx.scale(-1, 1);
        ctx.drawImage(temp, -temp.width,0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        temp.close();
        
        this.renderCanvas();
    }

    public flipHorizontally():void{
        if (!this.#backCanvas || !this.#image.imageData) return;

        this.#saveToHistory();
        
        const ctx = this.#backCanvas.getContext("2d");
        if (!ctx) return;

        let temp = this.#backCanvas.transferToImageBitmap();

        ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(temp, 0, -temp.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        temp.close();

        this.renderCanvas();
    }
    
    public goBack(){
        if (!this.#backCanvas || !this.#image.imageData) return;
        
        const img = this.#history.pop();
        if(img){

            const ctx = this.#backCanvas.getContext("2d");
            if (!ctx) return;
            
            //Clear back canvas
            ctx.clearRect(0,0, this.#backCanvas.width, this.#backCanvas.height);    
            
            //Resize to fit the image from history 
            this.#backCanvas.width = img.width;
            this.#backCanvas.height = img.height;
            
            ctx.putImageData(img, 0, 0);
            
            this.renderCanvas();
        }
        
    }
    
    
    
    
} 