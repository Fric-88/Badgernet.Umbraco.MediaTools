import {ImageDataList} from "./imageDataList.ts";
import {Point} from "./point.ts";
import {CropOverlay} from "./cropOverlay.ts";
import {Mouse} from "./mouse.ts";


export class Canvas {
    
    #imageUrl: string = "";
    #canvas: HTMLCanvasElement;
    #backCanvas?: OffscreenCanvas;
    #imageDataList: ImageDataList;
    #cropOverlay: CropOverlay;
    #cropOverlayVisible: boolean;
    #mouse: Mouse;
    
    readonly #context: CanvasRenderingContext2D | null;
    #offscreenContext?: OffscreenCanvasRenderingContext2D | null;

    constructor(canvas: HTMLCanvasElement){
        this.#canvas = canvas;
        this.#context = this.#canvas.getContext("2d");
        this.#imageDataList = new ImageDataList(50);
        this.#cropOverlay = new CropOverlay({x: 400, y: 400},{x: 250, y: 250 }, 12);
        this.#cropOverlayVisible = true;
        this.#mouse = new Mouse();
        this.#mouse.mouseDownCallback = (pointerLocation) => this.#onMouseDown(pointerLocation);
        this.#mouse.mouseUpCallback = ( ) => this.#onMouseUp();
        this.#mouse.mouseDragCallback = (moveAmount) => this.#onMouseDrag(moveAmount);
        
    }
    
    public registerListeners(){
        this.#mouse.registerListeners(this.#canvas);
    }
    
    public removeListeners(): void{
        this.#mouse.removeListeners();
    }
    
    private get backContext(){
        return this.#offscreenContext;
    }
    private get frontContext(){
        return this.#context;
    }
    
    #onMouseDown(pointerLocation: Point){
        if(this.#cropOverlayVisible){
            this.#cropOverlay.selectControl(pointerLocation);
        }
    }
    #onMouseUp(){
        if(this.#cropOverlayVisible){
            this.#cropOverlay.unselectControl();
        }
    }
    #onMouseDrag(moveAmount: Point){
        if(this.#cropOverlayVisible){
            
            this.#cropOverlay.moveActiveControl(moveAmount);
            this.renderFrontCanvas();
            
        }
    }
    
    public enableCropOverlay(){
        this.#cropOverlayVisible = true;
        this.renderFrontCanvas();
    }
    
    public disableCropOverlay(){
        this.#cropOverlayVisible = false;
        this.renderFrontCanvas();
    }
    
    #renderCropOverlay(ctx: CanvasRenderingContext2D){
        
        if(this.#cropOverlayVisible){
            const points = this.#cropOverlay.getDrawPoints();
            const controlRadius = this.#cropOverlay.getControlRadius();
            const overlayWidth = points.topRight.x - points.topLeft.x;
            const overlayHeight = points.bottomLeft.y - points.topLeft.y;
            const controlDiameter = controlRadius * 2;
            
            ctx.globalAlpha = 1;
            ctx.strokeStyle="#611FC4";
            ctx.fillStyle = "#FFFFFF";
            ctx.lineWidth = 2;

            //Stroke overlay  
            ctx.beginPath();
            ctx.moveTo(points.topLeft.x, points.topLeft.y);
            ctx.lineTo(points.topRight.x, points.topRight.y);
            ctx.lineTo(points.bottomRight.x, points.bottomRight.y);
            ctx.lineTo(points.bottomLeft.x, points.bottomLeft.y);
            ctx.lineTo(points.topLeft.x, points.topLeft.y);
            ctx.stroke();
            
            //Fill opaque overlay 
            ctx.globalAlpha = 0.2;
            ctx.fillRect(points.topLeft.x, points.topLeft.y, overlayWidth, overlayHeight);
            

            ctx.strokeStyle="#FFFFFF";
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 1;
             
            //Grid lines
            for(let i = 1; i <= 2 ; i++){
                ctx.beginPath();
                ctx.moveTo(points.topLeft.x + (overlayWidth / 3) * i , points.topLeft.y);
                ctx.lineTo(points.topLeft.x + (overlayWidth / 3) * i, points.topLeft.y + overlayHeight );
                
                ctx.moveTo(points.topLeft.x, points.topLeft.y + (overlayHeight / 3) * i);
                ctx.lineTo(points.topLeft.x + overlayWidth, points.topLeft.y + (overlayHeight / 3) * i);
                
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
            ctx.strokeStyle="#611FC4";
            ctx.fillStyle = "#9C83C1";
            
            
            //Move controls
            ctx.fillRect(points.topLeft.x - controlRadius, points.topLeft.y - controlRadius, controlDiameter, controlDiameter );
            ctx.strokeRect(points.topLeft.x - controlRadius, points.topLeft.y - controlRadius, controlDiameter, controlDiameter );
            ctx.fillRect(points.topRight.x - controlRadius, points.topRight.y - controlRadius, controlDiameter, controlDiameter );
            ctx.strokeRect(points.topRight.x - controlRadius, points.topRight.y - controlRadius, controlDiameter, controlDiameter );
            ctx.fillRect(points.bottomRight.x - controlRadius, points.bottomRight.y - controlRadius, controlDiameter, controlDiameter );
            ctx.strokeRect(points.bottomRight.x - controlRadius, points.bottomRight.y - controlRadius, controlDiameter, controlDiameter );
            ctx.fillRect(points.bottomLeft.x - controlRadius, points.bottomLeft.y - controlRadius, controlDiameter, controlDiameter);
            ctx.strokeRect(points.bottomLeft.x - controlRadius, points.bottomLeft.y - controlRadius, controlDiameter, controlDiameter );

        }
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
                this.#imageDataList.addData(ctx.getImageData(0,0,tempImgElement.naturalWidth, tempImgElement.naturalHeight));
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
        const ctx = this.frontContext;
        if (!ctx) return;
        
        const canvasWidth = this.#canvas.width;
        const canvasHeight = this.#canvas.height;
        
        const backCanvasWidth = this.#backCanvas.width;
        const backCanvasHeight = this.#backCanvas.height;
        
        const image = this.#imageDataList.getData();
        
        const CANVAS_PADDING = 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Recalculate draw size and draw target
        const drawSize = { x: backCanvasWidth, y: backCanvasHeight };
        const drawTarget = { x: 0, y: 0 };

        // Calculate aspect ratio
        const imageAspectRatio = backCanvasWidth / backCanvasHeight;

        // Scale down if image is larger than canvas with padding
        if (backCanvasWidth > canvasWidth - CANVAS_PADDING * 2 || backCanvasHeight > canvasHeight - CANVAS_PADDING * 2) {

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
            0, 0, backCanvasWidth, backCanvasHeight,
            drawTarget.x, drawTarget.y, drawSize.x, drawSize.y
        );
        
        //Draw the crop overlay if visible
        this.#renderCropOverlay(ctx);
        

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
        this.#imageDataList.addData(ctx.getImageData(0, 0, this.#backCanvas.width, this.#backCanvas.height));
    }

    //Flips image around the x-axis
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

    //Flips image around thy y-axis
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
    
    //Rotates this image around its center
    public rotateImage(rotation: number):void{
        if (!this.#backCanvas) return;
        const ctx = this.backContext
        if (!ctx) return;

        //Need to work with a copy of the unedited image to prevent stacking of the adjustments
        const image = this.#imageDataList.getCopy();
        
        this.#backCanvas.width = image.width;
        this.#backCanvas.height = image.height;
        ctx.putImageData(image, 0, 0);
        
        const tempImg = this.#backCanvas.transferToImageBitmap();
        
        //Clear back canvas
        ctx.clearRect(0, 0, this.#backCanvas.width, this.#backCanvas.height);
        
        
        //Resize canvas to fit rotating image
        if(!this.#imageDataList.isRotatedImage(image)){
            const diagonal = Math.sqrt(tempImg.width * tempImg.width + tempImg.height * tempImg.height);
            this.#backCanvas.width = diagonal;
            this.#backCanvas.height = diagonal;
        }

        
        ctx.translate(this.#backCanvas.width/2, this.#backCanvas.height/2);
        ctx.rotate(rotation * Math.PI/180);
        ctx.drawImage(tempImg, -tempImg.width / 2, -tempImg.height /2);
        ctx.resetTransform();
        
        tempImg.close();
        
        this.renderFrontCanvas();
    } 

    //Changes brightness, contrast, exposure and colors of the image on backCanvas   
    public adjustArrayValues(red: number, green: number, blue: number, brightness: number, contrast: number, exposure: number): void{
        if (!this.#backCanvas) return;
        const ctx = this.backContext
        if (!ctx) return;

        //Need to work with a copy of the unedited image to prevent stacking of the adjustments
        const image = this.#imageDataList.getCopy();
        
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast)); // Contrast factor
        let adjustment: number = 0; 
        
        for(let i= 0; i < image.data.length; i+= 4){

            adjustment = image.data[i] + brightness;
            adjustment = factor * (adjustment - 128) + 128;
            adjustment = adjustment * exposure;
            image.data[i] = adjustment + red;

            adjustment = image.data[i + 1] + brightness;
            adjustment = factor * (adjustment - 128) + 128;
            adjustment = adjustment * exposure;
            image.data[i + 1] = adjustment + green;

            adjustment = image.data[i + 2] + brightness + blue;
            adjustment = factor * (adjustment - 128) + 128;
            adjustment = adjustment * exposure;
            image.data[i + 2] = adjustment + blue;
        }
        
        ctx.putImageData(image, 0, 0);
        this.renderFrontCanvas();
    }
    
    //Saves backCanvas and re-renders frontCanvas 
    public applyChanges(){
        this.#saveChanges();
        this.renderFrontCanvas();
    }
    
    //Discards backCanvas and re-renders from the image list
    public discardChanges(){
        if (!this.#backCanvas) return;
        const ctx = this.backContext
        if (!ctx) return;
        
        const image = this.#imageDataList.getData();
        
        this.#backCanvas.width = image.width;
        this.#backCanvas.height = image.height;
        
        ctx.putImageData(image, 0, 0);
        this.renderFrontCanvas();
    }
    
    //Navigates back (undo)
    public undoChanges(){
        if (!this.#backCanvas) return;
        
        this.#imageDataList.goBack();
        const img = this.#imageDataList.getData();

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
    
    //Navigates forward (redo)
    public redoChanges(){
        if (!this.#backCanvas) return;

        this.#imageDataList.goForward();
        const img = this.#imageDataList.getData();

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