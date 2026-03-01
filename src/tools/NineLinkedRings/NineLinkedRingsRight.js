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
let gBackgroundLayer, glinkedRingLayer, gMessageLayer; //stage & layer
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
    constructor(el, width, height, rings, state) {
        this.el = el;
        this.width = width;
        this.height = height;
        this.numOfRings = rings;
        this.gStage = null
        this.startTime = 0;
        this.state = state
        this.init();
    }
    /**
     * 初始化整个九连环组件：
     * 1. 恢复/校验环数、速度、模式等全局配置
     * 2. 根据画布尺寸计算舞台与字体大小
     * 3. 创建 Konva 舞台及各图层
     * 4. 初始化所有环的默认状态（全上或全下）
     * 5. 绘制完整的九连环场景
     */
    init() {
        this.restoreRingsInfo();      // 恢复并校验环数、速度、模式
        this.initScreenXY();          // 依据画布宽高计算舞台尺寸与字体
        this.createStageLayer();      // 创建 Konva 舞台与五个图层
        this.initRingState();         // 根据 playMode 设置所有环的初始状态
        this.createLinkedRings();     // 绘制环、杆、横梁、点击区并挂载到舞台
    }

    /**
     * 恢复或赋予默认值：
     * - 环数：非法时取 5
     * - 速度级别：非法时取中间档
     * - 游戏模式：非法时默认为“全部上”目标
     */
    restoreRingsInfo() {
        var maxRings = RING_COLOR.length;        // 颜色数组长度即最大环数
        var maxtimeLevel = timeUnit.length;      // 速度数组长度
        timeLevel = 1;                           // 默认“快”
        playMode = 0;                            // 默认目标：全部环在上
        if (isNaN(this.numOfRings) || this.numOfRings < 3 || this.numOfRings > maxRings) this.numOfRings = 5;
        if (isNaN(timeLevel) || timeLevel < 0 || timeLevel > maxtimeLevel) timeLevel = Math.floor(maxtimeLevel / 2);
        if (isNaN(playMode) || playMode < 0 || playMode > 1) playMode = 0;
    }

    /**
     * 依据外部传入的宽高计算舞台可用尺寸与标题字号
     */
    initScreenXY() {
        SCREEN_X = this.width;                   // 浏览器可视宽度
        SCREEN_Y = this.height;                  // 浏览器可视高度
        STAGE_X = SCREEN_X - 10;                 // 舞台宽度（留边）
        STAGE_Y = SCREEN_Y - 10;                 // 舞台高度（留边）
        titleFontSize = Math.floor(STAGE_Y / 12); // 标题字号约为舞台高 1/12
    }

    /**
     * 创建 Konva 主舞台与五个逻辑图层：
     * background / linkedRing / message / ringNumber / mouse
     * 图层按顺序叠加，后者在上
     */
    createStageLayer() {
        this.gStage = new Konva.Stage({
            container: this.el,
            width: this.width,
            height: this.height
        });
        gBackgroundLayer = new Konva.Layer();   // 背景
        glinkedRingLayer = new Konva.Layer();     // 环、杆、横梁
        gMessageLayer = new Konva.Layer();        // 提示文字
        gRingNumberLayer = new Konva.Layer();     // 环序号标签
        gMouseLayer = new Konva.Layer();          // 点击热区
    }

    /**
     * 清空舞台所有子节点并重置各图层，
     * 用于重新绘制或销毁资源
     */
    clearStageLayer() {
        this.gStage.removeChildren();
        gBackgroundLayer.removeChildren();
        glinkedRingLayer.removeChildren();
        gMessageLayer.removeChildren();
        gRingNumberLayer.removeChildren();
        gMouseLayer.removeChildren();
    }

    /**
     * 根据 playMode 初始化 ringInitState 数组：
     * 0 表示目标“全部下”，1 表示目标“全部上”
     */
    initRingState() {
        var ringInitValue;
        var maxRings = RING_COLOR.length;

        if (playMode) ringInitValue = 0; // 目标：全部环在下
        else ringInitValue = 1;          // 目标：全部环在上

        ringInitState = [];
        for (var i = 0; i < maxRings; i++) {
            ringInitState[i] = ringInitValue;
        }
    }

    /**
     * 绘制完整九连环：
     * 1. 计算所有尺寸变量
     * 2. 清空舞台
     * 3. 初始化 workState & drawState
     * 4. 自右向左依次绘制每个环及其遮挡
     * 5. 绘制半圆横梁、前挡板
     * 6. 生成点击热区并挂载到鼠标图层
     * 7. 将各图层加入舞台，启用交互并刷新提示
     */
    createLinkedRings() {
        this.initGlobalVariable();            // 计算环距、杆长、坐标等
        this.clearStageLayer();               // 清空旧图
        this.initRingWorkState();             // 根据初始状态生成 work/draw 状态
        var leftRingId = this.getLeftmostUpperRing(); // 最左在上环，决定横梁位置
        if (leftRingId < 0) leftRingId = 1;   // 无在上环时默认横梁对齐第 1 环
        for (var id = this.numOfRings - 1; id >= 0; id--) {
            this.createRing(id, leftRingId);  // 绘制单环、杆、上下横梁段
        }
        this.createCircleBar();               // 绘制左侧半圆横梁
        this.createFrontBoard();              // 绘制前挡板
        for (var id = 0; id < this.numOfRings; id++) {
            this.createClickArea(id);         // 生成热区
            gMouseLayer.add(gClickArea[id]);
        }
        this.gStage.add(gBackgroundLayer);
        this.gStage.add(glinkedRingLayer);
        this.gStage.add(gMessageLayer);
        this.gStage.add(gRingNumberLayer);
        this.gStage.add(gMouseLayer);
        this.enableAllInput();                // 开启鼠标/键盘事件
        this.displaySteps();                  // 更新步数提示
        this.showRingBarNumber();             // 显示环序号
    }
    /**
     * 根据当前画布尺寸与环数，自适应计算所有绘制所需的尺寸常量。
     * 1. 从大到小遍历 sizeUnit，确保整体布局在舞台 80% 宽度与 100% 高度内；
     * 2. 计算环距、环尺寸、杆长、整体边界；
     * 3. 固定起始横坐标 startRingX = 150，纵坐标居中偏上；
     * 4. 生成横梁、挡板等组件所需的所有 Y 轴基准线；
     * 5. 最后调用 setTimeOutValue() 设置动画速度。
     */
    initGlobalVariable() {
        let boundX, boundY;   // 整体布局的宽、高边界
        let needBreak = 0;    // 控制循环退出标记：0 继续，1 已找到合适尺寸，2 再减一档后退出
        // 从 13 开始递减，寻找能让整体布局“刚好”放进舞台的最大 sizeUnit
        for (sizeUnit = 13; sizeUnit > 2; sizeUnit--) {
            ringDistanceX = sizeUnit * 8;      // 环中心水平间距
            ringDistanceY = sizeUnit * 7;      // 环中心垂直间距
            ringWidth = sizeUnit * 7;       // 椭圆环宽度（外接椭圆长轴）
            ringHigh = sizeUnit * 4;       // 椭圆环高度（外接椭圆短轴）
            // 环倾斜后，在 X/Y 方向上的投影长度（用于后续精确定位）
            ringX = Math.cos(ringAngle) * ringWidth;
            ringY = Math.sin(ringAngle) * ringWidth;
            // 杆长度：由最深环深度 + 2 档空余 + 环倾斜投影决定
            stickLength = (maxRingDeep + 2) * ringDistanceY + ringY;
            // 计算整体占位边界
            boundX = (this.numOfRings + 1.5) * ringDistanceX;                 // 水平方向
            boundY = ringDistanceY * 3 / 2 + stickLength + sizeUnit * 2;     // 垂直方向
            if (needBreak == 1) break;   // 已找到“最大 -1”档，直接退出
            // 若当前尺寸在舞台 80% 宽、100% 高内，则先记录，再减一档后退出
            if (boundX <= STAGE_X * 8 / 10 && boundY <= STAGE_Y) {
                needBreak++;
            }
        }

        // 固定起始横坐标，方便左侧留出手柄与半圆横梁空间
        startRingX = 150 + (this.numOfRings-1)*ringDistanceX;
        // 纵坐标：让整体布局在舞台垂直方向居中偏上
        startRingY = (STAGE_Y - boundY) / 4 + ringDistanceY * 1 / 2;
        // 横梁分段长度（普通段与最左侧半圆段）
        barLength = ringDistanceX;         // 普通段
        leftBarLength = ringDistanceX * 1 / 24; // 最左侧半圆横梁平直段
        // 横梁中心基准线
        barCenterY = startRingY + ringY + sizeUnit / 2;
        // 上横梁三条线：外框1、填充、外框2 的 Y 坐标
        bar0Stroke1Y = barCenterY - sizeUnit * 5 / 2 + 1;
        bar0FillY = barCenterY - sizeUnit * 2;
        bar0Stroke2Y = barCenterY - sizeUnit * 3 / 2 - 1;
        // 下横梁三条线：外框1、填充、外框2 的 Y 坐标
        bar1Stroke1Y = barCenterY + sizeUnit * 3 / 2 + 1;
        bar1FillY = barCenterY + sizeUnit * 2;
        bar1Stroke2Y = barCenterY + sizeUnit * 5 / 2 - 1;
        // 前挡板起始 Y：由最深环深度 + 环倾斜投影 + 固定偏移决定
        barBoardOffsetY = startRingY + maxRingDeep * ringDistanceY + (ringY + 1) * 2;
        // 最后根据速度级别计算动画帧间隔
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
    /**
     * 绘制第 id 号环及其关联部件（上横梁、下横梁、环本体、环杆、遮挡件）
     * @param {number} id          当前环序号（0 为最左环）
     * @param {number} leftRingId  最左侧“在上”环的序号，用于决定横梁绘制范围
     */
    createRing(id, leftRingId) {
        // ---------------- 基础坐标计算 ----------------
        let cx = startRingX - id * ringDistanceX;                       // 环杆中心 X
        let cy = startRingY + ringDrawState[id] * ringDistanceY;        // 环杆中心 Y（由深度决定）
        let width = sizeUnit;                                           // 全局线宽基准
        let eCX = cx - ringX + width / 2;                             // 椭圆环中心 X（考虑倾斜投影）
        let eCY = cy + ringY + width / 2;                             // 椭圆环中心 Y（考虑倾斜投影）

        // ---------------- 1. 上横梁（三段线模拟厚度） ----------------
        let bar0 = new Konva.Shape({
            sceneFunc: (canvas, shape) => {
                let context = canvas;
                // 上边框
                context.beginPath();
                context.moveTo(eCX, bar0Stroke1Y);
                context.lineTo(eCX + barLength, bar0Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);
                // 下边框
                context.beginPath();
                context.moveTo(eCX, bar0Stroke2Y);
                context.lineTo(eCX + barLength, bar0Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);
                // 中间填充
                context.beginPath();
                context.moveTo(eCX - 1, bar0FillY);
                context.lineTo(eCX + barLength + 1, bar0FillY);
                context.lineWidth = width;
                shape.setStrokeWidth(width - 1.5);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);
            }
        });

        // ---------------- 2. 环杆（含末端圆球、S 形过渡、半圆钩） ----------------
        var ringStick = new Konva.Shape({
            x: cx,
            y: cy,
            sceneFunc: (canvas, shape) => {
                var outlineWidth = 1;
                var sRadius = width / 2;                                  // 小半圆半径
                var bRadius = 1.6 * (width + outlineWidth);               // 大半圆半径
                var mRadius = (bRadius - 2 * sRadius);                    // 中圆半径
                var beginAngle = 0.5 / 3;                               // 30° 起始角
                var sOffsetX = -(bRadius - sRadius) * Math.sin(beginAngle * Math.PI);
                var sOffsetY = (bRadius - sRadius) * Math.cos(beginAngle * Math.PI);

                var context = canvas;

                // 末端圆球
                context.beginPath();
                this.drawEllipse(context, 0, stickLength + width * 2 -90, mRadius * 2, mRadius * 11 / 6, 0, 360);
                context.fillStyle = ENDING_BALL_COLOR;
                shape.setStroke(LINE_COLOR);
                context.fill();
                canvas.fillStrokeShape(shape);

                // 主体轮廓（小半圆→大半圆→S 弯→直杆→半圆钩→回连）
                context.beginPath();
                // 小半圆
                context.arc(sOffsetX, sOffsetY, sRadius, (beginAngle - 0.5) * Math.PI, (beginAngle + 0.5) * Math.PI, false);
                // 大半圆
                context.arc(0, 0, bRadius, (beginAngle + 0.5) * Math.PI, (beginAngle + 2) * Math.PI, false);
                // S 形过渡 1
                var startingX = bRadius * Math.cos((beginAngle + 2) * Math.PI);
                var startingY = bRadius * Math.sin((beginAngle + 2) * Math.PI);
                context.bezierCurveTo(startingX - width, startingY + width, startingX - width, startingY + width, width / 2, bRadius + width);
                // 直杆
                context.lineTo(width / 2, stickLength-90);
                // 半圆钩
                context.arc(0, stickLength + Math.cos(-beginAngle * Math.PI) * width-90, width / 2, 0 * Math.PI, 1 * Math.PI, false);
                // 直杆返回
                context.lineTo(-width / 2, bRadius + width);
                // S 形过渡 2
                var endingX = mRadius * Math.cos((beginAngle + 2) * Math.PI);
                var endingY = mRadius * Math.sin((beginAngle + 2) * Math.PI);
                context.bezierCurveTo(endingX - width, endingY + width, endingX - width, endingY + width, endingX, endingY);
                // 中圆闭合
                context.arc(0, 0, mRadius, (beginAngle + 2.0) * Math.PI, (beginAngle + 0.5) * Math.PI, true);

                context.fillStyle = STRICK_COLOR;
                shape.setStroke(LINE_COLOR);
                context.fill();
                canvas.fillStrokeShape(shape);
            },
            strokeWidth: .4
        });

        // ---------------- 3. 下横梁（同原理，三段线） ----------------
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

        // ---------------- 4. 椭圆环本体（倾斜 36°） ----------------
        var ellipse = new Konva.Shape({
            x: eCX +100,
            y: eCY,
            sceneFunc: (canvas, shape) => {
                var startAngle = 180, endAngle = 460;                   // 默认绘制 280° 弧
                if (id == 0) { startAngle = 0; endAngle = 360; }      // 最左环闭合
                var context = canvas;
                // 外框
                context.beginPath();
                this.drawEllipse(context, 0, 0, ringWidth, ringHigh, startAngle, endAngle);
                shape.setStrokeWidth(width - 1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);
                // 内色
                context.beginPath();
                this.drawEllipse(context, 0, 0, ringWidth, ringHigh, startAngle, endAngle);
                shape.setStrokeWidth(width - 2);
                shape.setStroke(RING_COLOR[id]);
                canvas.fillStrokeShape(shape);
            },
            rotation: 36,                                             // 整体倾斜
        });

        // ---------------- 5. 右侧相邻环的遮挡部分（仅非最右环需要） ----------------
        if (id + 1 != this.numOfRings) {
            var overCX = startRingX - (id + 1) * ringDistanceX;
            var overCY = startRingY + ringDrawState[id + 1] * ringDistanceY;
            var eOverCX = overCX - ringX + width / 2;
            var eOverCY = overCY + ringY + width / 2;

            var ellipseOver = new Konva.Shape({
                x: eOverCX+100,
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
                rotation: 36
            });
            glinedRingObject[id + 1].ellipseOver = ellipseOver;
        }

        // ---------------- 6. 环杆尾部遮挡（覆盖横梁缺口） ----------------
        var holdRingOver = new Konva.Shape({
            x: cx,
            y: cy,
            sceneFunc: (canvas, shape) => {
                var outlineWidth = 1;
                var sRadius = width / 2;
                var bRadius = 1.6 * (width + outlineWidth);
                var mRadius = (bRadius - 2 * sRadius);
                var beginAngle = 0.5 / 3;
                var sOffsetX = -(bRadius - sRadius) * Math.sin(beginAngle * Math.PI);
                var sOffsetY = (bRadius - sRadius) * Math.cos(beginAngle * Math.PI);
                var context = canvas;
                const num = id==0?1.4:1.9;
                context.beginPath();
                // 中圆
                context.arc(0, 0, mRadius, (beginAngle + num) * Math.PI, (beginAngle + 0.5) * Math.PI, true);
                // 小半圆
                context.arc(sOffsetX, sOffsetY, sRadius, (beginAngle - 0.5) * Math.PI, (beginAngle + 0.5) * Math.PI, false);
                // 大半圆
                context.arc(0, 0, bRadius, (beginAngle + 0.5) * Math.PI, (beginAngle + num) * Math.PI, false);

                context.fillStyle = STRICK_COLOR;
                context.fill();
                canvas.fillStrokeShape(shape);
            },
            stroke: LINE_COLOR,
            strokeWidth: .4
        });

        // ---------------- 7. 按深度顺序加入图层 ----------------
        if (id >= leftRingId) glinkedRingLayer.add(bar0);             // 上横梁（仅左侧“在上”环以左绘制）
        glinkedRingLayer.add(ringStick);                                // 环杆
        if (id + 1 != this.numOfRings) glinkedRingLayer.add(ellipseOver); // 右侧遮挡
        if (id >= leftRingId && ringDrawState[id] == 0) glinkedRingLayer.add(bar1); // 下横梁（环在杆上时）
        glinkedRingLayer.add(ellipse);                                  // 椭圆环
        glinkedRingLayer.add(holdRingOver);
         if (id >= leftRingId && ringDrawState[id] != 0) glinkedRingLayer.add(bar1);                               // 尾部遮挡
        // ---------------- 8. 缓存本环对象，便于动画/重绘 ----------------
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

        var barCX = startRingX - (leftRing - 1) * ringDistanceX - ringDistanceX / 4;

        //(1) create upper bar
        var upperBar = new Konva.Shape({
            x: barCX,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(-31, bar0Stroke1Y);
                context.lineTo(leftBarLength, bar0Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);
                context.beginPath();
                context.moveTo(-31, bar0Stroke2Y);
                context.lineTo(leftBarLength, bar0Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(-31, bar0FillY);
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
                context.moveTo(-31, bar1Stroke1Y);
                context.lineTo(leftBarLength, bar1Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(-31, bar1Stroke2Y);
                context.lineTo(leftBarLength, bar1Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(-31, bar1FillY);
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
                this.drawEllipse(context, 0, 0, eCX, eCY, 270, 360);
                shape.setStrokeWidth(width - 0.5);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 270, 361);
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
                this.drawEllipse(context, 0, 0, eCX, eCY, 0, 90);
                shape.setStrokeWidth(width - 0.5);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                this.drawEllipse(context, 0, 0, eCX, eCY, 0, 91);
                shape.setStrokeWidth(width - 1);
                shape.setStroke(BAR_COLOR);
                canvas.fillStrokeShape(shape);
            }
        });

        //------------------------------
        // begin for create handle bar 
        //------------------------------
        var beginHandleBarX = startRingX - (this.numOfRings) * ringDistanceX - ringX + width / 2;
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
            scale: { x: -1, y: -.9 }
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
            scale: { x: -1, y: -0.3 },
            rotation: 36 * 2
        });

        //upper handle bar
        var handleBarLength = leftRing * ringDistanceX + ringDistanceX / 2;
        var handleBarScale = handleBarLength / (ringDistanceX / 2);
        var upperHandleBar = new Konva.Shape({
            x: beginHandleBarX +39,
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
            x: beginHandleBarX +53,
            sceneFunc: (canvas, shape) => {
                var context = canvas;

                context.beginPath();
                context.moveTo(0, bar1Stroke1Y);
                context.lineTo(barLength * 1 / 3, bar1Stroke1Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar1Stroke2Y);
                context.lineTo(barLength * 1 / 3, bar1Stroke2Y);
                context.lineWidth = width;
                shape.setStrokeWidth(1);
                shape.setStroke(LINE_COLOR);
                canvas.fillStrokeShape(shape);

                context.beginPath();
                context.moveTo(0, bar1FillY);
                context.lineTo(barLength * 1 / 3, bar1FillY);
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
                var startX = startRingX + ringDistanceX;
                var endX = startRingX - this.numOfRings * ringDistanceX + ringDistanceX / 2;
                var startY = barBoardOffsetY -40;
                var width = sizeUnit;
                var context = canvas;
                //front bar board repeat for create thickness
                for (var i = sizeUnit / 2; i >= 0; i--) {
                    context.beginPath();
                    context.moveTo(endX - width, startY + 2 * width + i);
                    context.lineTo(endX - width / 2, startY + 3 * width + i);
                    context.quadraticCurveTo(endX, startY + 4 * width + i, endX + width, startY + 4 * width + i);
                    context.lineTo(endX + width, startY + 4 * width + i);
                    context.quadraticCurveTo(startX + width * 2, startY + 4 * width + i, startX + width * 3 / 2, startY + 3 * width + i);
                    context.lineTo(startX + width, startY + 2 * width);
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
                    var cx = startRingX - i * ringDistanceX;
                    var cy = startY + 2 * width;
                    context.beginPath();
                    this.drawEllipse(context, cx, cy, sizeUnit / 2 + 1, sizeUnit / 4, 0, 180);
                    shape.setStrokeWidth(1);
                    shape.setStroke(LINE_COLOR);
                    canvas.fillStrokeShape(shape);
                    context.beginPath();
                    this.drawEllipse(context, cx, cy, sizeUnit / 2, sizeUnit / 4 - 1, 0, 180);
                    context.fillStyle = STRICK_COLOR;
                    context.fill();
                }
            }
        });

        glinkedRingLayer.add(frontBoard);
    }
    createClickArea(id) {
        var cx = startRingX - id * ringDistanceX;

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

        } else { //finish

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
                x: startRingX - i * ringDistanceX + sizeUnit,
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

    moveRing(id, enableInputAfterFinish) {
        if (ringWorkState[id] == 0) { //move ring Up
            if (id == 0) {
                this.state.operations.push({
                    id: id,
                    dirction: "up"
                })
                this.cmdMoveRing0Up(id, enableInputAfterFinish);
            } else {
                this.state.operations.push({
                    id: id,
                    dirction: "up"
                })
                this.cmdMoveRingUp(id, enableInputAfterFinish);
            }
        } else { //move ring down 
            if (id == 0) {
                this.state.operations.push({
                    id: id,
                    dirction: "down"
                })
                this.cmdMoveRing0Down(id, enableInputAfterFinish);
            } else {
                this.state.operations.push({
                    id: id,
                    dirction: "down"
                })
                this.cmdMoveRingDown(id, enableInputAfterFinish);
            }
        }

    }
    drawXSign(id) {
        var cx = startRingX - id * ringDistanceX;
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
            gRingMoving = 1;
            this.disableAllInput();
        } else {
            const flag = typeof moveCmd[index - 1].isRunning === 'function'
            const rel = flag ? moveCmd[index - 1].isRunning() : moveCmd[index - 1].isRunning;
            if (rel) { 
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
        var cx = startRingX - id * ringDistanceX;
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
        flashUpSign.init(xSign, glinkedRingLayer, 0, 2, this);
        flashUpSign.start();
    }
    drawUpSign(id) {
        var cx = startRingX - id * ringDistanceX;
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
        flashUpSign.init(xSign, glinkedRingLayer, 0, 2, this);
        flashUpSign.start();
    }
    binaryToGray(num) {
        return (num >> 1) ^ num;
    }
    reset() {
        this.initRingState()
        this.createLinkedRings();
        this.state.operations = []
    }
    undo() {
        if (this.state.operations.length == 0) return;
        const { id, dirction } = this.state.operations.pop()
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
        endX = startRingX - (id - 1) * ringDistanceX - ringDistanceX / 4;
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
                moveHandleBar(curX, thatWidget);

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
        thatWidget = that
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
                moveHandleBar(curX, thatWidget);

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
function moveHandleBar(curX, thatWidget) {
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
    this.init = function (id, timeUnit, moveToBar, that) {
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
