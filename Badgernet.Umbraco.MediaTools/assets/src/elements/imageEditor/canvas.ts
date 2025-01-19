import {ImageDataList} from "./imageDataList.ts";
import {Point, subtractPoints} from "./point.ts";
import {CropOverlay} from "./cropOverlay.ts";
import {Mouse} from "./mouse.ts";


export class Canvas {
    
    #imageUrl: string = "";
    #canvas: HTMLCanvasElement;
    #backCanvas?: OffscreenCanvas;
    #imageDataList: ImageDataList;
    #cropOverlay: CropOverlay;
    #cropOverlayActive: boolean;
    #mouse: Mouse;
    
    #drawOrigin:Point;  //Top left corner of the image being drawn
    #drawWidth: number; //Width of the current image being drawn
    #drawHeight: number; //Height of the image being drawn
    
    readonly #context: CanvasRenderingContext2D | null;
    #offscreenContext?: OffscreenCanvasRenderingContext2D | null;

    constructor(canvas: HTMLCanvasElement){
        this.#canvas = canvas;
        this.#context = this.#canvas.getContext("2d");
        this.#imageDataList = new ImageDataList(50);
        this.#cropOverlay = new CropOverlay({x: 400, y: 400},{x: 250, y: 250 }, 12);
        this.#cropOverlayActive = false;
        this.#mouse = new Mouse();
        this.#mouse.mouseDownCallback = (pointerLocation) => this.#onMouseDown(pointerLocation);
        this.#mouse.mouseUpCallback = ( ) => this.#onMouseUp();
        this.#mouse.mouseDragCallback = (moveAmount) => this.#onMouseDrag(moveAmount);
        this.#drawOrigin = {x: 0, y: 0}
        this.#drawWidth = 0;
        this.#drawHeight = 0;
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
        if(this.#cropOverlayActive){
            this.#cropOverlay.selectControl(pointerLocation);
        }
    }
    #onMouseUp(){
        if(this.#cropOverlayActive){
            this.#cropOverlay.unselectControl();
        }
    }
    #onMouseDrag(moveAmount: Point){
        if(this.#cropOverlayActive){
            
            this.#cropOverlay.moveActiveControl(moveAmount);
            this.renderFrontCanvas();
            
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

    public enableCropOverlay(){
        this.#cropOverlayActive = true;
        this.#cropOverlay = new CropOverlay(this.#drawOrigin, {x: this.#drawWidth, y: this.#drawHeight}, 12);
        this.renderFrontCanvas();
    }

    public disableCropOverlay(){
        this.#cropOverlayActive = false;
        this.renderFrontCanvas();
    }
    
    public cropImage(){
        if(!this.#backCanvas || !this.backContext) return;
        if(this.#cropOverlayActive){
            
            const ctx = this.backContext;
            const cropPoints = this.#cropOverlay.getDrawPoints();

            const wRatio = this.#backCanvas.width / this.#drawWidth;
            const hRatio = this.#backCanvas.height / this.#drawHeight;

            //Limit point to not extend over the image
            if(cropPoints.topLeft.x < this.#drawOrigin.x){
                cropPoints.topLeft.x = this.#drawOrigin.x;
                cropPoints.bottomLeft.x = this.#drawOrigin.x;
            }
            if(cropPoints.topLeft.y < this.#drawOrigin.y){
                cropPoints.topLeft.y = this.#drawOrigin.y;
                cropPoints.topRight.y = this.#drawOrigin.y;
            }
            if(cropPoints.topRight.x > this.#drawOrigin.x + this.#drawWidth  ){
                cropPoints.topRight.x = this.#drawOrigin.x + this.#drawWidth  ;
                cropPoints.bottomRight.x = cropPoints.topRight.x;
            }
            
            if(cropPoints.bottomLeft.y > this.#drawOrigin.y + this.#drawHeight){
                cropPoints.bottomLeft.y = this.#drawOrigin.y + this.#drawHeight;
                cropPoints.bottomRight.y = cropPoints.bottomLeft.y;
            }
            
            
            //Adjust points in relation of frontCanvas image
            cropPoints.topLeft = subtractPoints(cropPoints.topLeft, this.#drawOrigin);
            cropPoints.topRight = subtractPoints(cropPoints.topRight, this.#drawOrigin);
            cropPoints.bottomLeft = subtractPoints(cropPoints.bottomLeft, this.#drawOrigin);
            cropPoints.bottomRight = subtractPoints(cropPoints.bottomRight, this.#drawOrigin);

            
            const sX = cropPoints.topLeft.x * wRatio;
            const sY = cropPoints.topLeft.y * hRatio;
            const sW = (cropPoints.topRight.x - cropPoints.topLeft.x) * wRatio;
            const sH = (cropPoints.bottomLeft.y - cropPoints.topLeft.y) * hRatio;
            
            const temp = ctx.getImageData(sX, sY, sW, sH);
            
            ctx.clearRect(0, 0, this.#backCanvas.width, this.#backCanvas.height);
            this.#backCanvas.width = temp.width;
            this.#backCanvas.height = temp.height;
            
            ctx.putImageData(temp, 0, 0);
            
            this.#saveChanges();
            this.disableCropOverlay();
            this.renderFrontCanvas();
        }
    }

    #renderCropOverlay(ctx: CanvasRenderingContext2D){

        if(this.#cropOverlayActive){
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
                
                const xOffset = (overlayWidth / 3) * i;
                const yOffset = (overlayHeight / 3) * i;

                // Vertical grid line
                ctx.beginPath();
                ctx.moveTo(points.topLeft.x + xOffset, points.topLeft.y);
                ctx.lineTo(points.topLeft.x + xOffset, points.topLeft.y + overlayHeight);
                ctx.stroke();

                // Horizontal grid line
                ctx.beginPath();
                ctx.moveTo(points.topLeft.x, points.topLeft.y + yOffset);
                ctx.lineTo(points.topLeft.x + overlayWidth, points.topLeft.y + yOffset);
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
        const maxDrawWidth = canvasWidth - CANVAS_PADDING * 2;
        const maxDrawHeight = canvasHeight - CANVAS_PADDING * 2;

        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Recalculate draw size and draw target
        const drawSize = { x: backCanvasWidth, y: backCanvasHeight };
        const drawTarget = { x: 0, y: 0 };

        // Calculate aspect ratio
        const imageAspectRatio = backCanvasWidth / backCanvasHeight;

        // Scale down if image is larger than canvas with padding
        if (backCanvasWidth > maxDrawWidth || backCanvasHeight > maxDrawHeight) {

            // Wider than taller
            if (imageAspectRatio > 1) {
                drawSize.x = maxDrawWidth;
                drawSize.y = drawSize.x / imageAspectRatio;

                // Adjust if height exceeds canvas (when resizing)
                if (drawSize.y > maxDrawHeight ) {
                    drawSize.y = maxDrawHeight;
                    drawSize.x = drawSize.y * imageAspectRatio;
                }
            } 
            else { // Taller than wider 
                drawSize.y = maxDrawHeight;
                drawSize.x = drawSize.y * imageAspectRatio;

                // Adjust if width exceeds canvas
                if (drawSize.x > maxDrawWidth) {
                    drawSize.x = maxDrawWidth;
                    drawSize.y = drawSize.x / imageAspectRatio;
                }
            }
        }

        // Center the image on the canvas
        drawTarget.x = (canvasWidth - drawSize.x) / 2;
        drawTarget.y = (canvasHeight - drawSize.y) / 2;

        this.#drawOrigin = drawTarget;
        this.#drawWidth = drawSize.x;
        this.#drawHeight = drawSize.y;
        
        // Draw image
        ctx.drawImage(
            this.#backCanvas,
            0, 0, backCanvasWidth, backCanvasHeight,
            drawTarget.x, drawTarget.y, drawSize.x, drawSize.y
        );
        
        //Draw the crop overlay if visible
        this.#renderCropOverlay(ctx);
        

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
        if (!this.#backCanvas || !this.backContext) return;
        const ctx = this.backContext

        //Need to work with a copy of the unedited image to prevent stacking of the adjustments
        const image = this.#imageDataList.getCopy();
        
        if(this.#backCanvas.width != image.width || this.#backCanvas.height != image.height) {
            this.#backCanvas.width = image.width;
            this.#backCanvas.height = image.height;
        }

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