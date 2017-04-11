//初始化gl信息
function init(){
    // 初始化——引用J3DI.js
    var gl = initWebGL(
        //canvas的id
        "myWebgl",
        // 顶点着色器和片段着色器的id
        "vshader", "fshader",
        // 着色器使用的顶点属性名称
        // 它们出现的顺序对应于它们的索引使用
        [ "vNormal", "vColor", "vPosition"],
        // 清除时的颜色值和深度值
        [ 0, 0, 0, 1 ], 10000);


    // 建立一个统一着色器变量
    gl.uniform3f(gl.getUniformLocation(gl.program, "lightDir"), 0, 0, 1);


    // 创建一个box，box属性包含顶点数组，法线，纹理坐标和指数——引用J3DI.js
    gl.box = makeBox(gl);


    // 设置立方体各个面的颜色
    var colors = new Uint8Array(
        [  0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,     // v0-v1-v2-v3 front
           1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,     // v0-v3-v4-v5 right
           0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,     // v0-v5-v6-v1 top
           1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,     // v1-v6-v7-v2 left
           1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,     // v7-v4-v3-v2 bottom
           0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1 ]    // v4-v7-v6-v5 back
                                            );
    // 为颜色设置顶点缓冲区
    gl.box.colorObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.colorObject);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);


    // 为稍后使用创建一些矩阵，并且将他们的地址保存在着色器中
    gl.mvMatrix = new J3DIMatrix4();
    gl.u_normalMatrixLoc = gl.getUniformLocation(gl.program, "u_normalMatrix");
    gl.normalMatrix = new J3DIMatrix4();
    gl.u_modelViewProjMatrixLoc = gl.getUniformLocation(gl.program, "u_modelViewProjMatrix");
    gl.mvpMatrix = new J3DIMatrix4();

    // 启动所有的顶点属性数组
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);

    // 为顶点，法线和颜色指定关联索引上的数组数据或元素数组数据的正确信息
    // void vertexAttribPointer(GLuint positionIndex, GLint size, GLenum type, GLboolean normalized, GLsizei stride, GLintptr offset);
    // size之单个数据的大小。比如，顶点的位置我们一般用(x,y,z)表示，则，此值为3；顶点的纹理坐标用(s,t)表示，则此值为2。
    // type指定数据的类型，可以为WebGL的BYTE、UNSIGNED_BYTE、SHORT、UNSIGNED_SHORT、FLOAT、FIXED等。
    // normalized指定数据转换为浮点型时，是否需要规范化。
    // stride指定相邻的两个数据之间的间隔
    // offset指定起始数据的偏移，以字节为单位。
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.vertexObject);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.normalObject);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.box.colorObject);
    gl.vertexAttribPointer(1, 4, gl.UNSIGNED_BYTE, false, 0, 0);

    // 绑定索引数组
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.box.indexObject);

    return gl;
}

width = -1;
height = -1;
// 重置gl参数
function reshape(gl){
    var canvas = document.getElementById('myWebgl');
    width = canvas.width;
    height = canvas.height;

    // 设定WebGL的渲染区域（视见区）
    gl.viewport(0, 0, width, height);

    //初始化透视矩阵——J3DIMath.js
    gl.perspectiveMatrix = new J3DIMatrix4();
    gl.perspectiveMatrix.perspective(30, width/height, 1, 10000);//透视效果设置
    gl.perspectiveMatrix.lookat(0, 0, 7, 0, 0, 0, 0, 1, 0);//摄像机等初始化坐标
}

function drawPicture(gl){
    reshape(gl);

    // 清空画布
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 设置模型变换矩阵
    gl.mvMatrix.makeIdentity();//返回有标示的矩阵
    gl.mvMatrix.rotate(20, 1,0,0);//绕x轴旋转20°
    gl.mvMatrix.rotate(currentAngle, 0,1,0);//绕y轴旋转currentAngle°，即动画旋转方向

    // 设置法线矩阵的旋转
    gl.normalMatrix.load(gl.mvMatrix);//加载顶点矩阵
    gl.normalMatrix.invert();
    gl.normalMatrix.transpose();
    gl.normalMatrix.setUniform(gl, gl.u_normalMatrixLoc, false);

    // 设置最终的坐标变换矩阵
    gl.mvpMatrix.load(gl.perspectiveMatrix);//加载透视矩阵
    gl.mvpMatrix.multiply(gl.mvMatrix);
    gl.mvpMatrix.setUniform(gl, gl.u_modelViewProjMatrixLoc, false);

    // 绘制立方体
    // drawElements(mode, count, type, offset)
    // mode:指定绘画的模式，有点、线、三角形、三角扇等
    //
    gl.drawElements(gl.TRIANGLES, gl.box.numIndices, gl.UNSIGNED_BYTE, 0);

    // 完成
    gl.flush();

    currentAngle += incAngle;
    if (currentAngle > 360)
        currentAngle -= 360;
}

function start(){
    var gl = init();
    currentAngle = 0;
    incAngle = 0.5;

    setInterval(function() { drawPicture(gl) }, 10);
}

start();