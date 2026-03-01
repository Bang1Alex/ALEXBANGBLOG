import Konva from "konva";

let maxRingDeep = 3;
let ringAngle = 1 / 5 * Math.PI;  //36 degree, 
let LINE_COLOR = "black";
let BAR_COLOR = "#bfbfbf";
let STRICK_COLOR = "#bfbfbf";
let ENDING_BALL_COLOR = "#bfbfbf";
let RING_COLOR = ["#66FF66", "#B266FF", "#66FFFF", "#FF66FF", "#66B2FF", "#FFB266", "#6666FF", "#FF66B2", "#FF6666"];
let HANDLE_BAR_COLOR1 = "#bfbfbf";
let HANDLE_BAR_COLOR2 = "#bfbfbf";
let SIGN_COLOR = "red"
let BAR_BOARD_FILL_COLOR = "#bfbfbf"; //closed to white
let BAR_BOARD_STROKE_COLOR = "#bfbfbf";
let playMode = 0;   //0:goal for all rings down, 1:goal for all rings up
let timeLevel = 3;  //medium
let timeUnit = [1, 20, 50, 100, 300]; //very fast, fast, medium, slow, very slow
let timeOut;
let gMouseLayer; //mouse event layer (separate from glinkedRingLayer 3/30/2013)
let  gBackgroundLayer, glinkedRingLayer, gMessageLayer; //stage & layer
let gRingNumberLayer; //for display ring number 
let ringInitState, ringWorkState, ringDrawState; //ring initial state, work state and draw state
let glinedRingObject = []; //for ring, stick and bar
let gBarObject;            //for half-circle bar 
let gClickArea = [];       //for click area 
let SCREEN_X, SCREEN_Y; //browser screen X Y
let STAGE_X, STAGE_Y; //kinetic stage X Y
let sizeUnit; //size unit for fixed to screen size
let titleFontSize; //title font size
let ringDistanceX, ringDistanceY; //ring x Y distance
let startRingX, startRingY; //ring start X Y
let stickLength; //ring stick length
let barLength, leftBarLength; //bar length for one ring, and leftmost bar length 
let ringWidth, ringHigh; //ring radius X Y
let ringX, ringY; //2*X = ring X length, 2*Y = ring Y length 	
let barCenterY;
let bar0Stroke1Y, bar0FillY, bar0Stroke2Y;
let bar1Stroke1Y, bar1FillY, bar1Stroke2Y;
let barBoardOffsetY; //bar board start Y	
class NineLinkedRings {
    constructor(el, width, height, rings,state) {
        this.el = el;
        this.width = width;
        this.height = height;
        this.numOfRings = rings;
        this.gStage = null
        this.startTime = 0;
        this.state =state
        this.init();
    }
    init() {
        this.restoreRingsInfo();
        this.initScreenXY();
        this.createStageLayer();
        this.initRingState();
        this.createLinkedRings();
    }
    restoreRingsInfo() {
        var maxRings = RING_COLOR.length;
        var maxtimeLevel = timeUnit.length;
        timeLevel = 1;
        playMode = 0;
        if (isNaN(this.numOfRings) || this.numOfRings < 3 || this.numOfRings > maxRings) this.numOfRings = 5;
        if (isNaN(timeLevel) || timeLevel < 0 || timeLevel > maxtimeLevel) timeLevel = Math.floor(maxtimeLevel / 2);
        if (isNaN(playMode) || playMode < 0 || playMode > 1) playMode = 0;
    }
    initScreenXY() {
        SCREEN_X = this.width;
        SCREEN_Y = this.height;
        STAGE_X = SCREEN_X - 10;
        STAGE_Y = SCREEN_Y - 10;
        titleFontSize = Math.floor(STAGE_Y / 12);
    }
    createStageLayer() {
         this.gStage = new Konva.Stage({
            container: this.el,
            width: this.width,
            height: this.height
        });
        gBackgroundLayer = new Konva.Layer();
        glinkedRingLayer = new Konva.Layer();
        gMessageLayer = new Konva.Layer();
        gRingNumberLayer = new Konva.Layer(); //for display ring number 
        gMouseLayer = new Konva.Layer();
    }
    clearStageLayer() {
         this.gStage.removeChildren();
        gBackgroundLayer.removeChildren();
        glinkedRingLayer.removeChildren();
        gMessageLayer.removeChildren();
        gRingNumberLayer.removeChildren(); //for display ring number 
        gMouseLayer.removeChildren();
    }

    initRingState() {
        var ringInitValue;
        var maxRings = RING_COLOR.length;

        if (playMode) ringInitValue = 0; //init all rings down
        else ringInitValue = 1; //init all rings up

        ringInitState = [];
        for (var i = 0; i < maxRings; i++) {
            ringInitState[i] = ringInitValue;
        }
    }
    createLinkedRings() {
        this.initGlobalVariable();
        this.clearStageLayer();
        this.initRingWorkState();
        var leftRingId = this.getLeftmostUpperRing();
        if (leftRingId < 0) leftRingId = 1; //if no upper rings assume bar at id = 1
        for (var id = this.numOfRings - 1; id >= 0; id--) {
            this.createRing(id, leftRingId);
        }
        this.createCircleBar();
        this.createFrontBoard();
        for (var id = 0; id < this.numOfRings; id++) {
            this.createClickArea(id);
            gMouseLayer.add(gClickArea[id]);
        }
         this.gStage.add(gBackgroundLayer);
         this.gStage.add(glinkedRingLayer);
         this.gStage.add(gMessageLayer);
         this.gStage.add(gRingNumberLayer); //for display ring number 
         this.gStage.add(gMouseLayer);
        this.enableAllInput();
        this.displaySteps();
        this.showRingBarNumber(); //for display ring number 
    }
    initGlobalVariable() {
        var boundX, boundY;
        var needBreak = 0;
        for (sizeUnit = 13; sizeUnit > 2; sizeUnit--) {
            ringDistanceX = sizeUnit * 8;
            ringDistanceY = sizeUnit * 7;
            ringWidth = sizeUnit * 7;
            ringHigh = sizeUnit * 4;
            ringX = Math.cos(ringAngle) * ringWidth;
            ringY = Math.sin(ringAngle) * ringWidth;

            stickLength = (maxRingDeep + 2) * ringDistanceY + ringY;

            boundX = (this.numOfRings + 1.5) * ringDistanceX
            boundY = ringDistanceY * 3 / 2 + stickLength + sizeUnit * 2;
            if (needBreak == 1) break; //max - 1

            if (boundX <= STAGE_X * 8 / 10 && boundY <= STAGE_Y) {
                needBreak++;
                //if(this.numOfRings == 9) break; //max
            }
        }

        if (STAGE_X - (this.numOfRings + 1) * ringDistanceX > ringDistanceX * 4) {
            startRingX = 150;
        } else {
               startRingX = 150;
        }
        startRingY = (STAGE_Y - boundY) / 4 + ringDistanceY * 1 / 2;
        barLength = ringDistanceX;
        leftBarLength = ringDistanceX * 3 / 5;
        barCenterY = startRingY + ringY + sizeUnit / 2;
        bar0Stroke1Y = barCenterY - sizeUnit * 5 / 2 + 1;
        bar0FillY = barCenterY - sizeUnit * 2;
        bar0Stroke2Y = barCenterY - sizeUnit * 3 / 2 - 1;
        bar1Stroke1Y = barCenterY + sizeUnit * 3 / 2 + 1;
        bar1FillY = barCenterY + sizeUnit * 2;
        bar1Stroke2Y = barCenterY + sizeUnit * 5 / 2 - 1;
        barBoardOffsetY = startRingY + maxRingDeep * ringDistanceY + (ringY + 1) * 2;
        this.setTimeOutValue();
    }
    setTimeOutValue() {
        if ((timeOut = Math.ceil(timeUnit[timeLevel] / 3)) < 1) timeOut = 1;
    }
    initRingWorkState() {
        var drawValue;
        ringDrawState = [];
        ringWorkState = [];
        for (var i = this.numOfRings - 1; i >= 0; i--) {
            if (ringInitState[i]) drawValue = 0;
            else {
                if (i == this.numOfRings - 1) drawValue = maxRingDeep;
                else drawValue = ringDrawState[i + 1] >= maxRingDeep ? maxRingDeep : ringDrawState[i + 1] + 1;
            }
            ringDrawState[i] = drawValue;
            ringWorkState[i] = ringInitState[i];
        }     
    }
    getLeftmostUpperRing() {
        for (var id = 0; id < this.numOfRings; id++) {
            if (ringWorkState[id]) return id;
        }
        return -1; //no upper ring
    }
    createRing(id, leftRingId) {
        var cx = startRingX + id * ringDistanceX;
        var cy = startRingY + ringDrawState[id] * ringDistanceY;
        var width = sizeUnit;
        var eCX = cx - ringX + width / 2;
        var eCY = cy + ringY + width / 2;

        //create upper bar 
        var bar0 = new Konva.Shape({
            sceneFunc: (canvas, shape) => {
                var context = canvas;
                context.beginPath();
                context.moveTo(eCX, bar0Stroke1Y);
                context.lineTo(eCX + barLength, bar0Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(eCX, bar0Stroke2Y);
                context.lineTo(eCX + barLength, bar0Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(eCX - 1, bar0FillY);
                context.lineTo(eCX + barLength + 1, bar0FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);
            }
        });

        //create ring stick
        var ringStick = new Konva.Shape({
            x: cx,
            y: cy,
            sceneFunc: (canvas, shape) => {
                var outlineWidth = 1;
                var sRadius = width / 2;  //small circle
                var bRadius = 1.6 * (width + outlineWidth); //big circle
                var mRadius = (bRadius - 2 * sRadius); //middle circle

                var beginAngle = 0.5 / 3; // 30 degree
                var sOffsetX = -(bRadius - sRadius) * Math.sin(beginAngle * Math.PI);
                var sOffsetY = (bRadius - sRadius) * Math.cos(beginAngle * Math.PI);

                var context = canvas;
                //ending ball
                context.beginPath();
                this.drawEllipse(context, 0, stickLength + width * 2 -90, mRadius * 2, mRadius * 11 / 6, 0, 360);
                context.fillStyle = ENDING_BALL_COLOR;
                shape.setStroke(LINE_COLOR);
                context.fill();
                canvas.fillStrokeShape(shape);

                context.beginPath();

                //draw small half circle, (-60 degree ~ 120 degree)	 [0.5 * PI = 90 degree ], clockwise
                context.arc(sOffsetX, sOffsetY, sRadius, (beginAngle - 0.5) * Math.PI, (beginAngle + 0.5) * Math.PI, false);

                //draw big circle from 120 degree to 390 degree clockwise
                context.arc(0, 0, bRadius, (beginAngle + 0.5) * Math.PI, (beginAngle + 2) * Math.PI, false);

                //draw s sign , to connect with stick
                var startingX = bRadius * Math.cos((beginAngle + 2) * Math.PI);
                var startingY = bRadius * Math.sin((beginAngle + 2) * Math.PI);
                var ctlX1 = startingX - width;
                var ctlY1 = startingY + width;
                var ctlX2 = startingX - width;
                var ctlY2 = startingY + width;
                context.bezierCurveTo(ctlX1, ctlY1, ctlX2, ctlY2, width / 2, bRadius + width);

                //draw stick 
                context.lineTo(width / 2, stickLength -90);

                // //draw half ball from 0 degree to 180 degree clockwise
                context.arc(0, stickLength + Math.cos(-beginAngle * Math.PI) * width -90, width / 2, 0 * Math.PI, 1 * Math.PI, false);

                // //draw stick 
                context.lineTo(-width / 2, bRadius + width);

                //draw s sign , to connect with cycle
                var endingX = mRadius * Math.cos((beginAngle + 2) * Math.PI);
                var endingY = mRadius * Math.sin((beginAngle + 2) * Math.PI);
                var ctlX1 = endingX - width;
                var ctlY1 = endingY + width;
                var ctlX2 = endingX - width;
                var ctlY2 = endingY + width;
                context.bezierCurveTo(ctlX1, ctlY1, ctlX2, ctlY2, endingX, endingY);

                //draw middle circle, from 390 degree - 120 degree, anticlockwise
                context.arc(0, 0, mRadius, (beginAngle + 2.0) * Math.PI, (beginAngle + 0.5) * Math.PI, true);

                //this.setFill(STRICK_COLOR);
                context.fillStyle = STRICK_COLOR;
                shape.setStroke(LINE_COLOR);
                //this.fill(context);
                context.fill();
                canvas.fillStrokeShape(shape);
            },
            strokeWidth: .4
        });

        //create lower bar
        var bar1 = new Konva.Shape({
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(eCX, bar1Stroke1Y);
                context.lineTo(eCX + barLength, bar1Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(eCX, bar1Stroke2Y);
                context.lineTo(eCX + barLength, bar1Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(eCX - 1, bar1FillY);
                context.lineTo(eCX + barLength + 1, bar1FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);
            }
        });

        //create ellipse ring 
        var ellipse = new Konva.Shape({
            x: eCX,
            y: eCY,

            sceneFunc: (canvas, shape) => {


                var startAngle = 180, endAngle = 460; //for id > 0
                if (id == 0) {
                    startAngle = 0;
                    endAngle = 360;
                }
                var context = canvas;

                context.beginPath();
                this.drawEllipse(context, 0, 0, ringWidth, ringHigh, startAngle, endAngle);
                shape.setStrokeWidth(width - 1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                this.drawEllipse(context, 0, 0, ringWidth, ringHigh, startAngle, endAngle);
                shape.setStrokeWidth(width - 2);
                shape.setStroke(RING_COLOR[id]);
                canvas.fillStrokeShape(shape);
            },
            rotation: -36,
        });

        // ellipse.setRotation(-ringAngle);
        if (id + 1 != this.numOfRings) {
            var overCX = startRingX + (id + 1) * ringDistanceX;
            var overCY = startRingY + ringDrawState[id + 1] * ringDistanceY;

            var eOverCX = overCX - ringX + width / 2;
            var eOverCY = overCY + ringY + width / 2;

            //create ellipse ring overlay part
            var ellipseOver = new Konva.Shape({
                x: eOverCX,
                y: eOverCY,
                sceneFunc: (canvas, shape) => {
                    var context = canvas;

                    context.beginPath();
                    this.drawEllipse(context, 0, 0, ringWidth, ringHigh, 100, 180);
                    shape.setStrokeWidth(width - 1);
                    shape.setStroke(LINE_COLOR);
                    canvas.fillStrokeShape(shape);

                    context.beginPath();
                    this.drawEllipse(context, 0, 0, ringWidth, ringHigh, 90, 190);
                    shape.setStrokeWidth(width - 2);
                    shape.setStroke(RING_COLOR[id + 1]);
                    canvas.fillStrokeShape(shape);
                },
                rotation: -36
            });
            glinedRingObject[id + 1].ellipseOver = ellipseOver;
        }

        //create hold ring overlay part
        var holdRingOver = new Konva.Shape({
            x: cx,
            y: cy,
            sceneFunc: (canvas, shape) => {
                var outlineWidth = 1;
                var sRadius = width / 2;  //small circle
                var bRadius = 1.6 * (width + outlineWidth); //big circle
                var mRadius = (bRadius - 2 * sRadius); //middle circle

                var beginAngle = 0.5 / 3; // 30 degree
                var sOffsetX = -(bRadius - sRadius) * Math.sin(beginAngle * Math.PI);
                var sOffsetY = (bRadius - sRadius) * Math.cos(beginAngle * Math.PI);

                var context = canvas;

                context.beginPath();

                //draw middle circle, from 390 degree - 120 degree, anticlockwise
                context.arc(0, 0, mRadius, (beginAngle + 1.5) * Math.PI, (beginAngle + 0.5) * Math.PI, true);

                //draw small half circle, (-60 degree ~ 120 degree)	 [0.5 * PI = 90 degree ], clockwise
                context.arc(sOffsetX, sOffsetY, sRadius, (beginAngle - 0.5) * Math.PI, (beginAngle + 0.5) * Math.PI, false);

                //draw big circle from 120 degree to 390 degree clockwise
                context.arc(0, 0, bRadius, (beginAngle + 0.5) * Math.PI, (beginAngle + 1.5) * Math.PI, false);

                //this.fill(context);
                context.fillStyle = STRICK_COLOR;
                context.fill();

                canvas.fillStrokeShape(shape);
            },
            //fill:STRICK_COLOR,
            stroke: LINE_COLOR,
            strokeWidth: .4
        });


        if (id >= leftRingId) glinkedRingLayer.add(bar0);
    

        glinkedRingLayer.add(ringStick);
        //@ts-ignore
        if (id + 1 != this.numOfRings) glinkedRingLayer.add(ellipseOver);

        if (id >= leftRingId && ringDrawState[id] == 0) glinkedRingLayer.add(bar1);	//in the bar
        glinkedRingLayer.add(ellipse);
        glinkedRingLayer.add(holdRingOver);
        if (id >= leftRingId && ringDrawState[id] != 0) glinkedRingLayer.add(bar1);	//in the bar

        glinedRingObject[id] = {
            ringStick: ringStick,
            ellipse: ellipse,
            holdRingOver: holdRingOver,
            bar0: bar0,
            bar1: bar1
        };

    }
    createCircleBar() {
        var width = sizeUnit;
        var leftRing = this.getLeftmostUpperRing();
        if (leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1

        var barCX = startRingX + (leftRing - 1) * ringDistanceX - ringDistanceX / 4;

        //(1) create upper bar
        var upperBar = new Konva.Shape({
            x: barCX,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, bar0Stroke1Y);
                context.lineTo(leftBarLength, bar0Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar0Stroke2Y);
                context.lineTo(leftBarLength, bar0Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(-.5, bar0FillY);
                context.lineTo(leftBarLength, bar0FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                //shape.setStroke(colorSofter(BAR_COLOR,0.3)); //for debug only
                canvas.fillStrokeShape(shape);
            }
        });

        //(2) create lower bar
        var lowerBar = new Konva.Shape({
            x: barCX,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, bar1Stroke1Y);
                context.lineTo(leftBarLength, bar1Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar1Stroke2Y);
                context.lineTo(leftBarLength, bar1Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(-.5, bar1FillY);
                context.lineTo(leftBarLength, bar1FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                //shape.setStroke(colorSofter(BAR_COLOR,0.2)); //for debug only
                canvas.fillStrokeShape(shape);
            }
        });


        var eCY = (bar1Stroke2Y - bar0Stroke1Y - width + 1) / 2;
        var eCX = eCY * 3 / 2;

        //create upper 1/4 circle
        var upperCircle = new Konva.Shape({
            x: barCX,
            y: (bar1Stroke1Y + bar0Stroke2Y) / 2,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 180, 270);
                shape.setStrokeWidth(width - 0.5);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 178, 271);
                shape.setStrokeWidth(width - 1);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);

            }
        });

        //create lower 1/4 circle
        var lowerCircle = new Konva.Shape({
            x: barCX,
            y: (bar1Stroke1Y + bar0Stroke2Y) / 2,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 90, 180);
                shape.setStrokeWidth(width - 0.5);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 89, 182);
                shape.setStrokeWidth(width - 1);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);
            }
        });

        //------------------------------
        // begin for create handle bar 
        //------------------------------
        var beginHandleBarX = startRingX + (this.numOfRings) * ringDistanceX - ringX + width / 2;
        var eHCX = beginHandleBarX + leftRing * ringDistanceX + ringDistanceX * 7 / 12;

        //handle bar 1
        var ellipseHandle1 = new Konva.Shape({
            x: eHCX,
            y: barCenterY,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(-ringDistanceX / 10, -ringHigh);
                context.lineTo(ringDistanceX * 1 / 10, -ringHigh);
                context.arc(ringDistanceX * 1 / 10, 0, ringHigh, 3 / 2 * Math.PI, 5 / 2 * Math.PI, false);
                //context.moveTo(ringDistanceX*3/2+10, ringHigh);
                context.lineTo(ringDistanceX / 10, ringHigh);

                //shape.fill(context);
                context.fillStyle = HANDLE_BAR_COLOR1;
                context.fill();
                shape.setStrokeWidth(.5);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);
            },
            //fill: HANDLE_BAR_COLOR1,
            scale: { x: 1, y: .9 }
        });

        //handle bar 2
        var ellipseHandle2 = new Konva.Shape({
            x: eHCX,
            y: barCenterY,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.arc(0, 0, ringHigh, 0, 2 * Math.PI, false);
                shape.setStrokeWidth(.5);
                shape.setStroke(LINE_COLOR);
                //shape.fill(context);
                context.fillStyle = HANDLE_BAR_COLOR2;
                context.fill();
                canvas.fillStrokeShape(shape);

            },
            //fill: HANDLE_BAR_COLOR2,
            scale: { x: 1, y: 0.3 },
            rotation: 36 * 2
        });

        //upper handle bar
        var handleBarLength = leftRing * ringDistanceX + ringDistanceX / 2;
        var handleBarScale = handleBarLength / (ringDistanceX / 2);
        var upperHandleBar = new Konva.Shape({
            x: beginHandleBarX,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, bar0Stroke1Y);
                context.lineTo(barLength / 2, bar0Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar0Stroke2Y);
                context.lineTo(barLength / 2, bar0Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar0FillY);
                context.lineTo(barLength / 2, bar0FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                //shape.setStroke(colorSofter(BAR_COLOR,0.3)); //for debug only
                canvas.fillStrokeShape(shape);
            },
            scale: { x: handleBarScale, y: 1 }
        });

        //lower handle bar
        var handleBarLength = leftRing * ringDistanceX + ringDistanceX * 2 / 3;
        var handleBarScale = handleBarLength / (ringDistanceX * 2 / 3);
        var lowerHandleBar = new Konva.Shape({
            x: beginHandleBarX,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, bar1Stroke1Y);
                context.lineTo(barLength * 2 / 3, bar1Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar1Stroke2Y);
                context.lineTo(barLength * 2 / 3, bar1Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar1FillY);
                context.lineTo(barLength * 2 / 3, bar1FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                //shape.setStroke(colorSofter(BAR_COLOR,0.2)); //for debug only
                canvas.fillStrokeShape(shape);
            },
            scale: { x: handleBarScale, y: 1 }
        });

        glinkedRingLayer.add(lowerCircle); // 四分子椭圆 下
        glinkedRingLayer.add(upperCircle); // 四分子椭圆 上
        glinkedRingLayer.add(lowerBar); //连接 椭圆的线段 上
        glinkedRingLayer.add(upperBar);//连接 椭圆的线段 下

        glinkedRingLayer.add(ellipseHandle1); // 粉色 握把1
        glinkedRingLayer.add(ellipseHandle2);// 粉色 握把2
        glinkedRingLayer.add(upperHandleBar);  // 连接握把的线段 上
        glinkedRingLayer.add(lowerHandleBar);// 连接握把的线段 下

        gBarObject = {
            upperBar: upperBar, lowerBar: lowerBar, upperCircle: upperCircle, lowerCircle: lowerCircle,
            ellipseHandle1: ellipseHandle1, ellipseHandle2: ellipseHandle2,
            upperHandleBar: upperHandleBar, lowerHandleBar: lowerHandleBar
        };
    }
    createFrontBoard() {
        var frontBoard = new Konva.Shape({
            sceneFunc: (canvas, shape) => {
                var startX = startRingX - ringDistanceX;
                var endX = startRingX + this.numOfRings * ringDistanceX - ringDistanceX / 2;

                var startY = barBoardOffsetY -40;
                var width = sizeUnit;

                var context = canvas;

                //front bar board repeat for create thickness
                for (var i = sizeUnit / 2; i >= 0; i--) {
                    context.beginPath();
                    context.moveTo(startX - width, startY + 2 * width + i);
                    context.lineTo(startX - width / 2, startY + 3 * width + i);
                    context.quadraticCurveTo(startX, startY + 4 * width + i, startX + width, startY + 4 * width + i);
                    context.lineTo(endX + width, startY + 4 * width + i);

                    context.quadraticCurveTo(endX + width * 2, startY + 4 * width + i, endX + width * 3 / 2, startY + 3 * width + i);
                    context.lineTo(endX + width, startY + 2 * width);
                    shape.setStrokeWidth(0.3);
                    //shape.setFill(BAR_BOARD_FILL_COLOR);
                    context.fillStyle = BAR_BOARD_FILL_COLOR;
                    shape.setStroke(BAR_BOARD_STROKE_COLOR);
                    //shape.fill(context);
                    context.fill();
                    canvas.fillStrokeShape(shape);
                }

                //draw front hold for ring stick
                for (var i = 0; i < this.numOfRings; i++) {
                    var cx = startRingX + i * ringDistanceX;
                    var cy = startY + 2 * width;
                    context.beginPath();
                    this.drawEllipse(context, cx, cy, sizeUnit / 2 + 1, sizeUnit / 4, 0, 180);
                    shape.setStrokeWidth(1);
                    shape.setStroke(LINE_COLOR);
                    canvas.fillStrokeShape(shape);

                    context.beginPath();
                    this.drawEllipse(context, cx, cy, sizeUnit / 2, sizeUnit / 4 - 1, 0, 180);
                    //shape.setFill(STRICK_COLOR);
                    //shape.fill(context);
                    context.fillStyle = STRICK_COLOR;
                    context.fill();
                }
            }
        });

        glinkedRingLayer.add(frontBoard);
    }
    createClickArea(id) {
        var cx = startRingX + id * ringDistanceX;

        //create click area
        var clickArea = new Konva.Shape({
            x: cx,
            y: startRingY,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, -2 * sizeUnit);
                context.lineTo(0, 50 * sizeUnit);
                canvas.fillStrokeShape(shape);
            },
            stroke: 'black',
            opacity: 0,
            strokeWidth: sizeUnit * 4
        });

        clickArea.id = id;
        gClickArea[id] = clickArea;
    }
    enableAllInput() {
        this.enableRingStickClick();
        this.enableRingStickCursorStyle();

    }
    disableAllInput() {
        this.disableRingStickClick();
    }
    drawEllipse(context, cx, cy, radiusX, radiusY, startAngleDeg, endAngleDeg) {
        var angle = startAngleDeg / 180 * Math.PI;
        var x = cx + radiusX * Math.cos(angle);
        var y = cy + radiusY * Math.sin(angle);

        for (var angleDeg = startAngleDeg; angleDeg <= endAngleDeg; angleDeg += .5) {
            angle = angleDeg / 180 * Math.PI;
            x = cx + radiusX * Math.cos(angle);
            y = cy + radiusY * Math.sin(angle);
            context.lineTo(x, y);
        }
    }
    enableRingStickClick() {
        for (var id = 0; id < this.numOfRings; id++) {
            gClickArea[id].on('click tap', (shape) => {
                var id = shape.target.id;
                if (id != 0 && (this.getLeftmostUpperRing() + 1) != id) {
                    this.drawXSign(id);
                } else {
                    this.moveRing(id, 1);
                }
            });
        }
    }
    enableRingStickCursorStyle() {
        // add cursor style
        for (var id = 0; id < this.numOfRings; id++) {
            gClickArea[id].on('mouseover', function () {
                document.body.style.cursor = 'pointer';
            });

            gClickArea[id].on('mouseout', function () {
                document.body.style.cursor = 'default';
            });
        }
    }
    disableRingStickClick() {
     
        for (var id = 0; id < this.numOfRings; id++) {
            gClickArea[id].off('click');
            gClickArea[id].off('tap');
        }
    }
    displaySteps() {
        var grayCode = 0;
        var targetGrayCode, targetBinaryCode;
        var binaryCode, nextGrayCode;

        if (playMode) targetGrayCode = Math.pow(2, this.numOfRings) - 1;
        else targetGrayCode = 0;

        for (var i = this.numOfRings - 1; i >= 0; i--) {
            grayCode = (grayCode << 1) + ringWorkState[i];
        }
        binaryCode = this.grayToBinary(grayCode, this.numOfRings);
        targetBinaryCode = this.grayToBinary(targetGrayCode, this.numOfRings);

        if (binaryCode != targetBinaryCode) {
            // this.writeMessage(Math.abs(binaryCode - targetBinaryCode));
        } else { //finish
            // this.writeMessage(textSuccess);
            this.disableRingStickClick();
            this.disableRingStickCursorStyle();
        }
    }
    disableRingStickCursorStyle() {
	document.body.style.cursor = 'default';

	for (var id = 0; id < this.numOfRings; id++) {
		gClickArea[id].off('mouseover mouseout');
	}
}
    showRingBarNumber() {

        gRingNumberLayer.clear();
        for (var i = 0; i < this.numOfRings; i++) {
            const text = new Konva.Text({
                x: startRingX + i * ringDistanceX + sizeUnit,
                y: barBoardOffsetY + 7.5 * sizeUnit -60,
                text: (i + 1).toString(),
                fontSize: titleFontSize * .5,
                fontFamily: 'Arial',
                fill: 'red'
            });
            gRingNumberLayer.add(text);

        }
    }
    grayToBinary(num, numBits) {
        var shift;
        for (shift = 1; shift < numBits; shift = 2 * shift) {
            num = num ^ (num >> shift);
        }
        return num;
    }
    writeMessage(message) {
        var context = gMessageLayer.getContext()._context;

        gMessageLayer.clear();
        context.font = titleFontSize * .75 + 'px arial';
        context.fillStyle = 'blue';
        context.fillText(message, 20, STAGE_Y - 40);
    }
    moveRing(id, enableInputAfterFinish) {
        if (ringWorkState[id] == 0) { //move ring Up
            if (id == 0) {
                this.state.operations.push({
                    id:id,
                    dirction:"up"
                })
                this.cmdMoveRing0Up(id, enableInputAfterFinish);
            } else {
                this.state.operations.push({
                    id:id,
                    dirction:"up"
                })
                this.cmdMoveRingUp(id, enableInputAfterFinish);
            }
        } else { //move ring down 
            if (id == 0) {
               this.state.operations.push({
                    id:id,
                    dirction:"down"
                })
                this.cmdMoveRing0Down(id, enableInputAfterFinish);
            } else {
                this.state.operations.push({
                    id:id,
                    dirction:"down"
                })
                this.cmdMoveRingDown(id, enableInputAfterFinish);
            }
        }
    }
    drawXSign(id) {
        var cx = startRingX + id * ringDistanceX;
        var cy = barBoardOffsetY + sizeUnit * 2;
        var signSize = sizeUnit * 5 / 2;

        var xSign = new Konva.Shape({
            x: cx,
            y: cy,
            sceneFunc: function (canvas, shape) {
                var context = canvas;

                context.beginPath();
                context.moveTo(-signSize, -signSize);
                context.lineTo(signSize, signSize);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(signSize, -signSize);
                context.lineTo(-signSize, signSize);
                canvas.fillStrokeShape(shape);
            },
            fill: SIGN_COLOR,
            stroke: SIGN_COLOR,
            strokeWidth: sizeUnit * 3 / 2
        });

        var flashXSign = new animateFlash();
        flashXSign.init(xSign, glinkedRingLayer, 0, 2, this);
        flashXSign.start();
    }
    cmdMoveRing0Up(id, enableInput) {
        var moveCommand = [
            { func: moveBarLeft1, isRunning: moveBarLeftRunning() },
            { func: moveRingUp, isRunning: moveRingRunning },
            { func: moveBarRight2, isRunning: moveBarRightRunning },
            { func: moveRingToBar, isRunning: moveRingRunning },
            { func: changeRingState, isRunning: () => { return 0; } },
            { func: moveBarLeft2, isRunning: moveBarLeftRunning(this) }
        ]
        this.runMoveCommand(id, moveCommand, enableInput, 0);
    }
    cmdMoveRingUp(id, enableInput) {
        var moveCommand = [
            { func: moveRingUp, isRunning: moveRingRunning },
            { func: moveBarRight2, isRunning: moveBarRightRunning },
            { func: moveRingToBar, isRunning: moveRingRunning },
            { func: changeRingState, isRunning: () => { return 0; } },
            { func: moveBarLeft2, isRunning: moveBarLeftRunning() }
        ];
        this.runMoveCommand(id, moveCommand, enableInput, 0);
    }
    cmdMoveRing0Down(id, enableInput) {
        var moveCommand = [
            { func: moveBarRight2, isRunning: moveBarRightRunning },
            { func: moveRingUp, isRunning: moveRingRunning },
            { func: moveBarLeft1, isRunning: moveBarLeftRunning() },
            { func: moveRingDown, isRunning: moveRingRunning },
            { func: changeRingState, isRunning: () => { return 0; } },
            { func: moveBarRight1, isRunning: moveBarRightRunning }
        ];
        this.runMoveCommand(id, moveCommand, enableInput, 0);
    }
    cmdMoveRingDown(id, enableInput) {
        var moveCommand = [
            { func: moveBarRight2, isRunning: moveBarRightRunning },
            { func: moveRingUp, isRunning: moveRingRunning },
            { func: moveBarLeft2, isRunning: moveBarLeftRunning() },
            { func: moveRingDown, isRunning: moveRingRunning },
            { func: changeRingState, isRunning: () => { return 0; } }
        ];
        this.runMoveCommand(id, moveCommand, enableInput, 0);
    }
    runMoveCommand(id, moveCmd, enableInput, index) {  
        if (index == 0) {
            //start move
            gRingMoving = 1;
            this.disableAllInput();
        } else {
            const flag = typeof moveCmd[index - 1].isRunning === 'function'
            const rel = flag ? moveCmd[index - 1].isRunning() : moveCmd[index - 1].isRunning;
            
            if (rel) { //previous command is running, wait it ! 
                setTimeout(() => { this.runMoveCommand(id, moveCmd, enableInput, index); }, timeOut);
                return;
            }
        }

        if (index < moveCmd.length) {
            moveCmd[index].func(id, this); //execute command
            //waiting for running next command
            setTimeout(() => { this.runMoveCommand(id, moveCmd, enableInput, index + 1); }, timeOut);
        } else {
            //end move
            if (enableInput) this.enableAllInput();
            this.displaySteps();
            gRingMoving = 0;
        }
    }
    hintsButton() {
	var id = this.getNextMoveRing();
	if (id >= 0) {
		if (ringWorkState[id]) {
			this.drawDownSign(id);
		} else {
			this.drawUpSign(id);
		}
	}
}
getNextMoveRing() {
	var grayCode = 0;
	var targetGrayCode, targetBinaryCode;
	var binaryCode, nextGrayCode;

	if (playMode) targetGrayCode = Math.pow(2, this.numOfRings) - 1; //all rings up
	else targetGrayCode = 0; //all rings down

	for (var i = this.numOfRings - 1; i >= 0; i--) {
		//gray code of current working state
		grayCode = (grayCode << 1) + ringWorkState[i];
	}
	binaryCode = this.grayToBinary(grayCode, this.numOfRings);
	targetBinaryCode = this.grayToBinary(targetGrayCode, this.numOfRings);

	if (binaryCode != targetBinaryCode) {
		//get next number close to target
		if (binaryCode > targetBinaryCode) binaryCode--;
		else binaryCode++;
		nextGrayCode = this.binaryToGray(binaryCode);

		//find the change bit (next changed ring id)
		for (var id = 0; id < this.numOfRings; id++) {
			if ((nextGrayCode & 1) != ringWorkState[id])
				break;
			nextGrayCode >>= 1;
		}
		return id;
	}
	return -1; //finish (current state = target state)
}
drawDownSign(id) {
	var cx = startRingX + id * ringDistanceX;
	var cy = barBoardOffsetY - sizeUnit * 0.75;
	var signSize = sizeUnit;

	var xSign = new Konva.Shape({
		x: cx,
		y: cy,
		sceneFunc: function (canvas, shape) {
			var context = canvas;

			context.beginPath();
			context.moveTo(-signSize, 0);
			context.lineTo(-signSize, signSize * 3);
			context.lineTo(-signSize * 2.5, signSize * 3);
			context.lineTo(0, signSize * 5.5);
			context.lineTo(signSize * 2.5, signSize * 3);
			context.lineTo(signSize, signSize * 3);
			context.lineTo(signSize, 0);
			canvas.fillStrokeShape(shape);
		},
		fill: SIGN_COLOR,
		stroke: SIGN_COLOR
	});

	var flashUpSign = new animateFlash();
	flashUpSign.init(xSign, glinkedRingLayer, 0, 2,this);
	flashUpSign.start();
}
drawUpSign(id) {
	var cx = startRingX + id * ringDistanceX;
	var cy = barBoardOffsetY + sizeUnit * 4.75;
	var signSize = sizeUnit;

	var xSign = new Konva.Shape({
		x: cx,
		y: cy,
		sceneFunc: function (canvas, shape) {
			var context = canvas;
			context.beginPath();
			context.moveTo(-signSize, 0);
			context.lineTo(-signSize, -signSize * 3);
			context.lineTo(-signSize * 2.5, -signSize * 3);
			context.lineTo(0, -signSize * 5.5);
			context.lineTo(signSize * 2.5, -signSize * 3);
			context.lineTo(signSize, -signSize * 3);
			context.lineTo(signSize, 0);
			canvas.fillStrokeShape(shape);
		},
		fill: SIGN_COLOR,
		stroke: SIGN_COLOR
	});

	var flashUpSign = new animateFlash();
	flashUpSign.init(xSign, glinkedRingLayer, 0, 2,this);
	flashUpSign.start();
}
binaryToGray(num) {
	return (num >> 1) ^ num;
}
reset(){
    this.initRingState()
	 this.createLinkedRings();
    this.state.operations =[]
}
undo(){
    if(this.state.operations.length == 0) return;
   const  {id,dirction}=this.state.operations.pop()
   const enableInputAfterFinish = 1
  
     if (ringWorkState[id] == 0) { //move ring Up
            if (id == 0) {
                this.cmdMoveRing0Up(id, enableInputAfterFinish);
            } else {
                this.cmdMoveRingUp(id, enableInputAfterFinish);
            }
        } else {  
            if (id == 0) {
                this.cmdMoveRing0Down(id, enableInputAfterFinish);
            } else {
                this.cmdMoveRingDown(id, enableInputAfterFinish);
            }
        }
}
}

function animateFlash() {
    let object, layer;
    let startFlashTime;
    let flashTimes;
    let thatWidget;
    //@ts-ignore
    this.init = function (myObject, myLayer, startTime, times, that) {
        object = myObject;
        layer = myLayer;
        startFlashTime = startTime;
        flashTimes = times;
        thatWidget = that
    };
    //@ts-ignore
    this.start = function () {
        let flashOnTime = 150, flashOffTime = 100;
        let lastToggleTime = -200;
        let flashOn = 1;

        let anim = new Konva.Animation(
            function (frame) {
                var time = frame.time;

                if (time > startFlashTime) {
                    if (flashOn) {
                        if (time - lastToggleTime > flashOffTime) {
                            layer.add(object);
                            layer.draw();
                            flashOn = 0;
                            lastToggleTime = time;
                        }
                    } else {
                        if (time - lastToggleTime > flashOnTime) {
                            object.remove(); //kineticJS 4.5.0
                            layer.draw();
                            flashOn = 1;
                            lastToggleTime = time;
                            if (--flashTimes == 0) {
                                anim.stop();
                                let running = 0;
                                thatWidget.enableAllInput();
                            }
                        }
                    }
                }
            },
            layer
        );
        thatWidget.disableAllInput();
        let running = 1;
        anim.start();
    };
    //@ts-ignore
    this.isRunning = function () {
        return flashTimes;
    };
}
var gRingMoving = 0;


//--------------------
// change ring state 
//--------------------
function changeRingState(id) {
    ringWorkState[id] ^= 1; //toggle
}

//==========================
// BEGIN for move commands
//==========================

// var moveLeftObject = new animateMoveBarLeft();
// var moveRightObject = new animateMoveBarRight();
var moveRingObject = new animateMoveRing();

//----------------------------------------
// check move bar left command is running 
//----------------------------------------
function moveBarLeftRunning() {
    // return moveLeftObject.isRunning();
}

//-----------------------------------------
// check move bar right command is running
//-----------------------------------------
function moveBarRightRunning() {
    // return moveRightObject.isRunning();
}

//------------------------------------
// check move ring up|down is running 
//------------------------------------
function moveRingRunning() {
    return moveRingObject.isRunning();
}

//------------------------
// move bar left (mode 1)
//------------------------
function moveBarLeft1(id, that) {
    // moveLeftObject.init(id, timeUnit[timeLevel], 1, that);
    // moveLeftObject.start();
}

//------------------------
// move bar left (mode 2)
//------------------------
function moveBarLeft2(id, that) {
    // if (id) id--;
    // moveLeftObject.init(id, timeUnit[timeLevel], 2, that);
    // moveLeftObject.start();
}

//-------------------------
// move bar right (mode 1)
//-------------------------
function moveBarRight1(id, that) {
    // moveRightObject.init(id, timeUnit[timeLevel], 1, that);
    // moveRightObject.start();
}

//-------------------------
// move bar right (mode 2)
//-------------------------
function moveBarRight2(id, that) {
    // if (id) id--;
    // moveRightObject.init(id, timeUnit[timeLevel], 2, that);
    // moveRightObject.start();
}

//-----------------------------
// move ring up (over the bar)
//-----------------------------
function moveRingUp(id, that) {
    moveRingObject.init(id, timeUnit[timeLevel], 0, that);
    moveRingObject.start();
}

//-----------------
// move ring down
//-----------------
function moveRingDown(id, that) {
    moveRingObject.init(id, timeUnit[timeLevel], 0, that);
    moveRingObject.start();
}

//----------------------------
// move ring down to the bar
//----------------------------
function moveRingToBar(id, that) {
    moveRingObject.init(id, timeUnit[timeLevel], 1, that);
    moveRingObject.start();
}
function animateMoveBarLeft() {
    var running = 0;
    var startX, endX, shiftX, barStartX;
    var objId, duration, mode;
    var thatWidget;

    //leftMode: 
    // 1: move half-circle-bar that closed to ring to left
    // 2: move half-circle-bar that closed to stick to left
    // @ts-ignore	
    this.init = function (id, timeUnit, leftMode, that) {
        thatWidget = that;
        objId = id;
        duration = timeUnit;
        mode = leftMode;

        if (id == 0 && mode == 1) {
            var leftRing = thatWidget.getLeftmostUpperRing();
            if (leftRing <= 0) leftRing = 1; //if no upper ring or id = 0 assume move time = timeUnit
            duration *= leftRing;
        }

        startX = gBarObject.upperBar.getPosition().x;
        endX = startRingX + (id - 1) * ringDistanceX - ringDistanceX / 4;
        let endScale = (startX - endX) / leftBarLength;
        shiftX = startX - endX;
        barStartX = startX + (gBarObject.upperBar.getScale().x * leftBarLength)
    };
    // @ts-ignore	
    this.start = function () {
        var addBar = 0, halfCircleTop = 0;
        var anim = new Konva.Animation(
            function (frame) {
                var time = frame.time;

                if (time > duration) time = duration;
                var curX = startX - shiftX * time / duration;

                //set bar position	
                gBarObject.upperCircle.setX(curX);
                gBarObject.lowerCircle.setX(curX);
                gBarObject.upperBar.setX(curX);
                gBarObject.lowerBar.setX(curX);
                moveHandleBar(curX,thatWidget);

                if (mode == 2) {
                    if (!addBar && time > duration / 2) {
                        addBar = 1;

                        //(1) add bar 0 & bar1	
                        let zIndex = glinedRingObject[objId].ringStick.getZIndex() - 1;
                        glinkedRingLayer.add(glinedRingObject[objId].bar0);
                        glinedRingObject[objId].bar0.setZIndex(zIndex);

                        zIndex = glinedRingObject[objId].ringStick.getZIndex() + 1;
                        glinkedRingLayer.add(glinedRingObject[objId].bar1)
                        glinedRingObject[objId].bar1.setZIndex(zIndex);

                        //(2) change bar bar starX because add the bar0 & bar1
                        barStartX = curX + leftBarLength * 5 / 12;

                        //(3) set half-circle-bar to top for override the ring 		
                        gBarObject.upperBar.moveToTop();
                        gBarObject.lowerBar.moveToTop();
                    }
                    if (!halfCircleTop && time > duration * 2 / 5) {
                        halfCircleTop = 1;
                        //set half-circle to top for override the ring	
                        gBarObject.upperCircle.moveToTop();
                        gBarObject.lowerCircle.moveToTop();
                    }
                }
                //set the scale for change the bar length from barStartX to curX
                var curScale = (barStartX - curX) / leftBarLength
                // gBarObject.upperBar.setScale(curScale, 1);
                // gBarObject.lowerBar.setScale(curScale, 1);

                if (time >= duration) {
                    if (mode == 1) {
                        var leftRing = thatWidget.getLeftmostUpperRing();
                        if (leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1

                        //add bar0 && bar1 from leftmost upper ring to current id	
                        var startId = (leftRing == 0) ? 0 : (leftRing - 1);
                        for (var i = startId; i >= objId; i--) {
                            glinkedRingLayer.add(glinedRingObject[i].bar0)
                            glinkedRingLayer.add(glinedRingObject[i].bar1)
                            let zIndex = glinedRingObject[i].ringStick.getZIndex() - 1;
                            glinedRingObject[i].bar0.setZIndex(zIndex);
                            zIndex = glinedRingObject[objId].holdRingOver.getZIndex() + 1;
                            glinedRingObject[i].bar1.setZIndex(zIndex);
                        }

                        //in back of ringStick
                        var zIndex = glinedRingObject[objId].ringStick.getZIndex() - 1;
                        //glinedRingObject[objId].bar0.setZIndex(zIndex);
                        gBarObject.upperCircle.setZIndex(zIndex);
                        gBarObject.upperBar.setZIndex(zIndex);

                        //in front of ring
                        zIndex = glinedRingObject[objId].holdRingOver.getZIndex() + 1;
                        //glinedRingObject[objId].bar1.setZIndex(zIndex);
                        gBarObject.lowerCircle.setZIndex(zIndex);
                        gBarObject.lowerBar.setZIndex(zIndex);
                    }

                    //set scale X to 1
                    // gBarObject.upperBar.setScale(1, 1);
                    // gBarObject.lowerBar.setScale(1, 1);

                    anim.stop();
                    running = 0;
                }
            },
            glinkedRingLayer
        );
        running = 1;
        anim.start();
    };
    // @ts-ignore	
    this.isRunning = function () {
        return running;
    };
}

//=======================
// class: move bar right
//=======================
function animateMoveBarRight() {
    var running = 0;
    var startX, endX, shiftX, barEndX;
    var objId, duration, mode, numOfBar;
    var leftRing;
    var thatWidget
    //rightMode = 1: for ring-0 move closed to leftmost upper ring
    //rightMode = 2: move bar-half-circle closed to strick
    // @ts-ignore
    this.init = function (id, timeUnit, rightMode, that) {
        objId = id;
        mode = rightMode;
        thatWidget =that
        startX = gBarObject.upperBar.getPosition().x;
        if (mode == 2) {
            numOfBar = 1;
            endX = startRingX + id * ringDistanceX + ringDistanceX / 5;
            barEndX = startX + leftBarLength;
        } else { //mode = 1
            leftRing = thatWidget.getLeftmostUpperRing();
            if (leftRing < 0) leftRing = 1; //if no upper rings assume bar at id = 1

            numOfBar = leftRing - id;
            endX = startRingX + (leftRing - 1) * ringDistanceX - ringDistanceX / 4;
            barEndX = endX + leftBarLength;
        }
        duration = timeUnit * numOfBar;
        shiftX = startX - endX;
    };
    // @ts-ignore
    this.start = function () {
        //@ts-ignore
        var removeBar = 0, changeBarOrder = 0, changeBarCircleOrder = 0;
        var curScale;
        //var removeAdd = 0;
        var anim = new Konva.Animation(
            function (frame) {
                var time = frame.time;

                if (time > duration) time = duration;
                var curX = startX - shiftX * time / duration;

                gBarObject.upperCircle.setX(curX);
                gBarObject.lowerCircle.setX(curX);
                gBarObject.upperBar.setX(curX);
                gBarObject.lowerBar.setX(curX);
                moveHandleBar(curX,thatWidget);

                if (mode == 2) { //move bar-half-circle closed to strick
                    if (!changeBarOrder && time > duration / 3) {
                        changeBarOrder = 1;
                        //in back of ringStick (half-circle-upper bar)
                        let zIndex = glinedRingObject[objId].ringStick.getZIndex() - 1;
                        gBarObject.upperBar.setZIndex(zIndex);

                        //in front of ringStick (half-circle-lower bar)
                        zIndex = glinedRingObject[objId].ringStick.getZIndex() + 1;
                        gBarObject.lowerBar.setZIndex(zIndex);

                        //change of half-circle-bar 
                        barEndX = endX + leftBarLength * .5;
                    }

                    if (!changeBarCircleOrder && time > duration * 3 / 5) {
                        changeBarCircleOrder = 1;

                        //in back of ringStick (half-upper-circle bar)
                        let zIndex = glinedRingObject[objId].ringStick.getZIndex() - 1;
                        gBarObject.upperCircle.setZIndex(zIndex);

                        //in front of ringStick (half-lower-circle bar)
                        zIndex = glinedRingObject[objId].ringStick.getZIndex() + 1;
                        gBarObject.lowerCircle.setZIndex(zIndex);
                    }
                }

                if (!removeBar) { //remove redundant bar
                    if (time > duration / (numOfBar + 2)) {
                        removeBar = 1;
                        for (var i = 0; i < numOfBar; i++) {
                            glinedRingObject[objId + i].bar0.remove(); //kineticJS 4.5.0
                            glinedRingObject[objId + i].bar1.remove(); //kineticJS 4.5.0
                        }

                    }
                }

                //set scale of half-circle upper and lower bar
                curScale = (barEndX - curX) / leftBarLength;
                // gBarObject.upperBar.setScale(curScale, 1);
                // gBarObject.lowerBar.setScale(curScale, 1);

                if (time >= duration) {
                    anim.stop();
                    running = 0;
                }
            },
            glinkedRingLayer
        );
        running = 1;
        anim.start();
    };
    // @ts-ignore
    this.isRunning = function () {
        return running;
    };
}

//-----------------------------------
// move handle bar to position curX
//-----------------------------------
function moveHandleBar(curX,thatWidget) {
    var beginHandleBarX = (thatWidget.numOfRings) * ringDistanceX + leftBarLength;
    var eHCX = beginHandleBarX + ringDistanceX * 7 / 12 + curX

    //set handle bar position
    // gBarObject.ellipseHandle1.setX(eHCX);
    // gBarObject.ellipseHandle2.setX(eHCX);
    //@ts-ignore
    var beginHandleBarX = startRingX - ringX;
    var endHandleBarX = ringDistanceX + sizeUnit / 2 + curX;

    //set upper handle bar scale
    var handleBarLength = endHandleBarX - beginHandleBarX;
    var handleBarScale = handleBarLength / (ringDistanceX / 2);
    // gBarObject.upperHandleBar.setScale(handleBarScale, 1);

    //set lower handle bar scale
    var endHandleBarX = ringDistanceX + ringDistanceX / 6 + sizeUnit / 2 + curX;
    var handleBarLength = endHandleBarX - beginHandleBarX;
    handleBarScale = handleBarLength / (ringDistanceX * 2 / 3);
    // gBarObject.lowerHandleBar.setScale(handleBarScale, 1);

}
function animateMoveRing() {
    var object;
    var duration;
    var running = 0;
    var endRingDrawState, startY, shiftY;
    var moveUp;
    var objId;
    let thatWidget
    this.init = function (id, timeUnit, moveToBar,that) {
        objId = id;
        thatWidget = that;
        if (ringDrawState[objId] >= 0) {
            moveUp = 1;
            //current state: under the bar, move up
            endRingDrawState = -1;
            if (id > 0 && ringDrawState[objId] > 0) {

                var zIndex = glinedRingObject[objId].ellipse.getZIndex();
                glinedRingObject[objId - 1].bar0.setZIndex(zIndex - 1); //under the ellipse

                var zIndex = glinedRingObject[objId].ringStick.getZIndex();
                glinedRingObject[objId].bar0.setZIndex(zIndex - 1); //under the ringStick

                var zIndex = glinedRingObject[objId - 1].ringStick.getZIndex();
                glinedRingObject[objId].ellipseOver.setZIndex(zIndex + 1); //ellipseOver over ringStick of id-1

                var zIndex = glinedRingObject[objId].ellipseOver.getZIndex();
                glinedRingObject[objId].bar1.setZIndex(zIndex + 1); //over ellipseOver			
            }
        } else {
            //current state: over the bar, move down to bar or move down under the bar. 
            moveUp = 0;
            if (moveToBar) {
                endRingDrawState = 0;
                if (id > 0) {
                    var zIndex = glinedRingObject[objId].ringStick.getZIndex();
                    glinedRingObject[objId].bar1.setZIndex(zIndex + 1); //over the stick & under the ellipse
                }
            } else {
                //calculate ring down position
                if (objId == thatWidget.numOfRings - 1) { //rightmost ring
                    endRingDrawState = maxRingDeep;
                } else {
                    endRingDrawState = ringDrawState[objId + 1] >= maxRingDeep ? maxRingDeep : (ringDrawState[objId + 1] + 1);
                }
                if (id > 0) {
                    var zIndex = glinedRingObject[objId].ellipse.getZIndex();
                    glinedRingObject[objId - 1].bar0.setZIndex(zIndex - 1); //under the ellipse

                    zIndex = glinedRingObject[objId - 1].ringStick.getZIndex();
                    glinedRingObject[objId].ellipseOver.setZIndex(zIndex + 1); //ellipseOver over ringStick of id-1

                    var zIndex = glinedRingObject[objId].ringStick.getZIndex();
                    glinedRingObject[objId].bar0.setZIndex(zIndex - 1); //under the ringStick
                    var zIndex = glinedRingObject[objId].ellipseOver.getZIndex();
                    glinedRingObject[objId].bar1.setZIndex(zIndex + 1); //over ellipseOver

                }
            }
        }
        startY = glinedRingObject[objId].ringStick.getPosition().y;
        shiftY = (endRingDrawState - ringDrawState[objId]) * ringDistanceY;
        duration = Math.abs(endRingDrawState - ringDrawState[objId]) * timeUnit;
    };
    this.start = function () {
        var anim = new Konva.Animation(
            function (frame) {
                var time = frame.time;

                if (time > duration) time = duration;
                var curY = startY + shiftY * time / duration;

                glinedRingObject[objId].ringStick.setY(curY);
                glinedRingObject[objId].ellipse.setY(curY + ringY + sizeUnit / 2);
                glinedRingObject[objId].holdRingOver.setY(curY);
                //if(typeof glinedRingObject[objId].ellipseOver != "undefined") { 
                if (objId != 0) { //ring 0 without overlay ellipes ring 
                    glinedRingObject[objId].ellipseOver.setY(curY + ringY + sizeUnit / 2);
                }

                if (time >= duration) {
                    ringDrawState[objId] = endRingDrawState;
                    anim.stop();
                    running = 0;
                }
            },
            glinkedRingLayer
        );
        running = 1;
        anim.start();
    };
    // @ts-ignore
    this.isRunning = function () {
        return running;
    };
}
export default NineLinkedRings;
