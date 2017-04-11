/*
 * 简单的立方体3d旋转效果
 */

var canvas = document.getElementById("myCanvas");
var cxt = canvas.getContext("2d");

cxt.lineWidth = 3;
var halfW = 200;
var canvasX = 350;
var canvasY = 250;

/*
 * 1、旋转效果是以立方体中心轴旋转，所以假设立方体中心为坐标轴原点
 * 2、摄像机和屏幕假设始终保持静止，只是通过立方体旋转来达到3d旋转效果
 * 3、摄像机在z轴上，显示屏平行于x0y轴平面
 *
 */

//下面构建立方体的8个顶点坐标，需考虑点相连形成12条边来设计
//    v4----- v5
//   /|      /|
//  v7------v6|
//  | |     | |
//  | |v0---|-|v1
//  |/      |/
//  v3------v2
var basePoints = [{x: -halfW, y: -halfW, z: -halfW},
            {x: -halfW, y: halfW, z: -halfW},
            {x: halfW, y: halfW, z: -halfW},
            {x: halfW, y: -halfW, z: -halfW},
            {x: -halfW, y: -halfW, z: halfW},
            {x: -halfW, y: halfW, z: halfW},
            {x: halfW, y: halfW, z: halfW},
            {x: halfW, y: -halfW, z: halfW}];

//摄像机坐标
var vz = 1000;
//假设显示屏在立方体和摄像机之间的位置
var z0 = 300;

/*
 *点的投影：
 * x = x1 * |(vz - z0)/(vz - z1)|
 * y = y1 * |(vz - z0)/(vz - z1)|
*/
function createPoints(points){
    var newPoints = [];
    for(var i=0; i<points.length; i++){
        var p = {};
        p.x = points[i].x * Math.abs((vz - z0)/(vz - points[i].z));
        p.y = points[i].y * Math.abs((vz - z0)/(vz - points[i].z));
        newPoints.push(p);
    }
    return newPoints;
}

//立方体绘制：将各个点连接起来，共12条边（投影顺序）
function drawPic(points){
    cxt.clearRect(0, 0, canvasX*2, canvasY*2);
    cxt.beginPath();
    cxt.fillStyle = "#f4c900";

    //绘制骨架正方体
    cxt.moveTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.lineTo(canvasX + points[1].x, canvasY + points[1].y);
    cxt.lineTo(canvasX + points[2].x, canvasY + points[2].y);
    cxt.lineTo(canvasX + points[3].x, canvasY + points[3].y);
    cxt.lineTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.fill();

    cxt.moveTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.lineTo(canvasX + points[1].x, canvasY + points[1].y);
    cxt.lineTo(canvasX + points[5].x, canvasY + points[5].y);
    cxt.lineTo(canvasX + points[4].x, canvasY + points[4].y);
    cxt.lineTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.fill();

    cxt.moveTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.lineTo(canvasX + points[3].x, canvasY + points[3].y);
    cxt.lineTo(canvasX + points[7].x, canvasY + points[7].y);
    cxt.lineTo(canvasX + points[4].x, canvasY + points[4].y);
    cxt.lineTo(canvasX + points[0].x, canvasY + points[0].y);
    cxt.fill();

    cxt.moveTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.lineTo(canvasX + points[5].x, canvasY + points[5].y);
    cxt.lineTo(canvasX + points[4].x, canvasY + points[4].y);
    cxt.lineTo(canvasX + points[7].x, canvasY + points[7].y);
    cxt.lineTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.fill();

    cxt.moveTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.lineTo(canvasX + points[2].x, canvasY + points[2].y);
    cxt.lineTo(canvasX + points[1].x, canvasY + points[1].y);
    cxt.lineTo(canvasX + points[5].x, canvasY + points[5].y);
    cxt.lineTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.fill();

    cxt.moveTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.lineTo(canvasX + points[2].x, canvasY + points[2].y);
    cxt.lineTo(canvasX + points[3].x, canvasY + points[3].y);
    cxt.lineTo(canvasX + points[7].x, canvasY + points[7].y);
    cxt.lineTo(canvasX + points[6].x, canvasY + points[6].y);
    cxt.fill();

    cxt.stroke();
}

//首先把立方体绘制在屏幕上
drawPic(createPoints(basePoints));


/*
 *旋转函数：将points的各个点旋转角度为angle，这里假设绕x轴和y轴都旋转
 * 围绕x轴旋转：
        y = y1*cosβ - z1*sinβ
        z = y1*sinβ + z1*cosβ
        x = x1
 * 围绕y轴旋转：
        z = z1*cosβ - x1*sinβ
        x = z1*sinβ + x1*cosβ
        y = y1
 * 围绕z轴旋转：
        x = x1*cosβ - y1*sinβ
        y = x1*sinβ + y1*cosβ
        z = z1
 */
function rotatePic(points, angle){
    var newPoints = [];
    angle = (angle / (360 / (2 * Math.PI)));
    //绕x轴
    for(var i=0; i<points.length; i++){
        var tempX = points[i].x;
        var tempY = points[i].y;
        var tempZ = points[i].z;
        var p = {};
        p.y = tempY * Math.cos(angle) - tempZ * Math.sin(angle);
        p.z = tempY * Math.sin(angle) + tempZ * Math.cos(angle);
        p.x = tempX;
        newPoints.push(p);
    }

    //绕y轴
    for(var i=0; i<points.length; i++){
        var tempX = newPoints[i].x;
        var tempY = newPoints[i].y;
        var tempZ = newPoints[i].z;
        newPoints[i].z = tempZ * Math.cos(angle) - tempX * Math.sin(angle);
        newPoints[i].x = tempZ * Math.sin(angle) + tempX * Math.cos(angle);
    }
    //映射并绘制
    drawPic(createPoints(newPoints));
}


//绑定点击后旋转
var changeInter = null;
canvas.onclick = function(){
    var currentAngle = 0;
    if(changeInter){
        clearInterval(changeInter);
        changeInter = null;
        drawPic(createPoints(basePoints));
    }else{

        changeInter = setInterval(function() {
            currentAngle += 5;
            rotatePic(basePoints, currentAngle);
        }, 100);
    }
}
