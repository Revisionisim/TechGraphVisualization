/* import G6 from '@antv/g6'; */
import { grid, tooltip } from "./plugin.js";
// 获取搜索框和按钮元素
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const candidateList = document.createElement('ul');
candidateList.className = 'candidate-list';
const searchWrapper = document.querySelector('.search-wrapper');
searchWrapper.appendChild(candidateList);




searchButton.addEventListener('click', () => {
    const keyword = searchInput.value; // 获取搜索关键字
    const nodes = graph.findAll('node', node => node.getModel().orilabel.includes(keyword) || node.getModel().category === (keyword));


    if (nodes && nodes.length > 0) {
        const count = nodes.length;
        console.warn(`一共找到 ${count} 个节点.`);
        nodes.forEach(node => {
            graph.setItemState(node, 'focus', true); // 设置节点选中状态
            graph.focusItem(node); // 将节点居中展开

        });


    } else
        alert('没有找到符合条件的节点');

});


candidateList.addEventListener('click', (e) => {
    searchInput.value = e.target.innerHTML;
    console.log(searchInput.value);
});




// 绑定搜索按钮点击事件
searchInput.addEventListener('input', () => {
    const keyword = searchInput.value; // 获取搜索关键字
    const nodes = graph.findAll('node', node => node.getModel().orilabel.includes(keyword) || node.getModel().category === keyword);

    // 清空候选列表
    candidateList.innerHTML = '';

    if (nodes && nodes.length > 0) {


        nodes.forEach(node => {


            const candidate = document.createElement('li');
            candidate.className = 'candidate-item';
            candidate.innerHTML = node.getModel().orilabel;

            candidateList.appendChild(candidate);
        });

        // 显示候选列表
        candidateList.style.display = 'block';
    } else {


        // 隐藏候选列表
        candidateList.style.display = 'none';
    }
});

searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const keyword = searchInput.value; // 获取搜索关键字
        const nodes = graph.findAll('node', node => node.getModel().orilabel.includes(keyword) || node.getModel().category === (keyword));


        if (nodes && nodes.length > 0) {
            const count = nodes.length;
            alert(`一共找到 ${count} 个节点.`);
            nodes.forEach(node => {
                graph.setItemState(node, 'focus', true); // 设置节点选中状态
                graph.focusItem(node); // 将节点居中展开

            });


        } else
            alert('没有找到符合条件的节点');
    }
});



const { uniqueId } = G6.Util;

const NODESIZEMAPPING = 'degree';
const SMALLGRAPHLABELMAXLENGTH = 5;
let labelMaxLength = SMALLGRAPHLABELMAXLENGTH;
/* const DEFAULTNODESIZE = 20;
const DEFAULTAGGREGATEDNODESIZE = 53; */
const NODE_LIMIT = 2000; // TODO: find a proper number for maximum node number on the canvas

let graph = null;
let currentUnproccessedData = { nodes: [], edges: [] };
let nodeMap = {};
let aggregatedNodeMap = {};
let hiddenItemIds = []; // 隐藏的元素 id 数组
let largeGraphMode = true;
let cachePositions = {};
let manipulatePosition = undefined;
let descreteNodeCenter;
let layout = {
    type: '',
    instance: null,
    destroyed: true,
};
let expandArray = [];
let collapseArray = [];
let shiftKeydown = false;

let CANVAS_WIDTH = 1000,
    CANVAS_HEIGHT = 600;

const duration = 4000;
const animateOpacity = 0.6;
const animateBackOpacity = 0.1;
const virtualEdgeOpacity = 0.1;
const realEdgeOpacity = 0.2;

const darkBackColor = 'rgb(43, 47, 51)';
const disableColor = '#777';
const theme = 'dark';
const subjectColors = [
    '#0f63a9',
    '#eb4d4b',
    'rgba(251, 197, 49,1.0)',
    '#91cc75',
    'rgba(156, 136, 255,1.0)',
    'rgba(127, 143, 166,1.0)'
];

const colorSets = G6.Util.getColorSetsBySubjectColors(
    subjectColors,
    darkBackColor,
    theme,
    disableColor,
);

const global = {
    node: {
        style: {
            fill: '#2B384E',
        },
        labelCfg: {
            style: {
                fill: '#acaeaf',
                stroke: '#191b1c',
            },
        },
        stateStyles: {
            focus: {
                fill: '#2B384E',
            },
            selected: {
                lineWidth: 10,
                strokeOpacity: 0.5
            },
            activeByLegend: {
                lineWidth: 10,
                strokeOpacity: 0.5
            },
            inactiveByLegend: {
                opacity: 0.5
            }
        },
    },
    edge: {
        style: {
            stroke: '#acaeaf',
            realEdgeStroke: '#acaeaf', //'#f00',
            realEdgeOpacity,
            strokeOpacity: realEdgeOpacity,
        },
        labelCfg: {
            style: {
                fill: '#acaeaf',
                realEdgeStroke: '#acaeaf', //'#f00',
                realEdgeOpacity: 0.5,
                stroke: '#191b1c',
            },
        },
        stateStyles: {
            focus: {
                stroke: '#fff', // '#3C9AE8',
            },
        },
    },
};


G6.registerNode(
    '聚合节点', {
        draw(cfg, group) {

            let width = cfg.count * 2,
                height = cfg.count * 2;
            const style = cfg.style || {};
            const colorSet = cfg.colorSet || colorSets[0];

            // halo for hover
            group.addShape('rect', {
                attrs: {
                    x: -width * 0.6,
                    y: -height * 0.6,
                    width: width * 1.2,
                    height: height * 1.2,
                    fill: colorSet.mainFill,
                    opacity: 0.8,
                    lineWidth: 0.5,
                    radius: (height / 2 || 13) * 1.2,
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: 'halo-shape',
                visible: false,
            });

            // focus stroke for hover
            group.addShape('rect', {
                attrs: {
                    x: -width * 0.6,
                    y: -height * 0.6,
                    width: width * 1.2,
                    height: height * 1.2,
                    fill: colorSet.mainFill, // '#3B4043',
                    stroke: 'rgba(245, 246, 250,1.0)',
                    lineWidth: 3,
                    lineOpacty: 0.5,
                    radius: (height / 2 || 13) * 1.2,
                },
                name: 'stroke-shape',
                visible: false,
            });

            const keyShape = group.addShape('rect', {
                attrs: {
                    ...style,
                    x: -width / 2,
                    y: -height / 2,
                    width,
                    height,
                    fill: colorSet.mainFill, // || '#3B4043',
                    opacity: 0.2,
                    stroke: colorSet.mainStroke,
                    lineWidth: 4,
                    cursor: 'pointer',
                    radius: height / 2 || 13,
                    lineDash: [12, 12],
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: 'aggregated-node-keyShape',
            });

            let labelStyle = {};
            if (cfg.labelCfg) {
                labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
            }
            group.addShape('text', {
                attrs: {
                    text: cfg.label,
                    x: 0,
                    y: -10,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    cursor: 'pointer',
                    fontSize: 14,
                    fill: 'rgba(245, 246, 250,0.8)',
                    fontWeight: 600,
                },
                name: 'label-shape',
                className: 'label-shape',
            });

            group.addShape('text', {
                attrs: {
                    text: `节点总数：${cfg.count + 431}`,
                    x: 0,
                    y: 10,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    cursor: 'pointer',
                    fontSize: 12,
                    fill: 'rgba(220, 221, 225,0.8)',
                    opacity: 0.85,
                    fontWeight: 400,
                },
                name: 'count-shape',
                className: 'count-shape',
                draggable: true,
            });


            // tag for new node
            if (cfg.new) {
                group.addShape('circle', {
                    attrs: {
                        x: width / 2 - 3,
                        y: -height / 2 + 3,
                        r: 4,
                        fill: '#6DD400',
                        lineWidth: 0.5,
                        stroke: '#FFFFFF',
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: 'typeNode-tag-circle',
                });
            }
            return keyShape;
        },
        setState: (name, value, item) => {
            const group = item.get('group');
            if (name === 'layoutEnd' && value) {
                const labelShape = group.find((e) => e.get('name') === 'text-shape');
                if (labelShape) labelShape.set('visible', true);
            } else if (name === 'hover') {
                if (item.hasState('focus')) {
                    return;
                }
                const halo = group.find((e) => e.get('name') === 'halo-shape');
                const keyShape = item.getKeyShape();
                const colorSet = item.getModel().colorSet || colorSets[0];
                if (value) {
                    halo && halo.show();
                    keyShape.attr('fill', colorSet.activeFill);
                } else {
                    halo && halo.hide();
                    keyShape.attr('fill', colorSet.mainFill);
                }
            } else if (name === 'focus') {
                const stroke = group.find((e) => e.get('name') === 'stroke-shape');
                const keyShape = item.getKeyShape();
                const colorSet = item.getModel().colorSet || colorSets[0];
                if (value) {
                    stroke && stroke.show();
                    keyShape.attr('fill', colorSet.selectedFill);
                } else {
                    stroke && stroke.hide();
                    keyShape.attr('fill', colorSet.mainFill);
                }
            }
        },
        update: undefined,
    },
    '聚合节点',
);


G6.registerNode(
    '普通节点', {
        draw(cfg, group) {

            const degreeSum = cfg.degree;

            var r = (degreeSum * 1.5) + 5;
            /*   if (isNumber(cfg.size)) {
                  r = cfg.size / 2;
              } else if (isArray(cfg.size)) {
                  r = cfg.size[0] / 2;
              } */
            const style = cfg.style || {};
            const colorSet = cfg.colorSet || colorSets[0];



            // halo for hover
            group.addShape('circle', {
                attrs: {
                    x: 0,
                    y: 0,
                    r: r + 5,
                    fill: style.fill || colorSet.mainFill || '#2B384E',
                    opacity: 0.7,
                    lineWidth: 0,
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: 'halo-shape',
                visible: false,
            });

            // focus stroke for hover
            group.addShape('circle', {
                attrs: {
                    x: 0,
                    y: 0,
                    r: r + 5,

                    fill: style.fill || colorSet.mainFill || '#2B384E',
                    stroke: 'rgba(245, 246, 250,1.0)',
                    strokeOpacity: 0.85,
                    lineWidth: 2,
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: 'stroke-shape',
                visible: false,
            });

            const keyShape = group.addShape('circle', {
                attrs: {
                    ...style,
                    x: 0,
                    y: 0,
                    r,
                    fill: colorSet.mainFill,

                    stroke: colorSet.mainStroke,
                    lineWidth: 2,
                    cursor: 'pointer',
                },
                // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                name: 'aggregated-node-keyShape',
            });

            let labelStyle = {};
            if (cfg.labelCfg) {
                labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
            }

            if (cfg.label) {
                const text = cfg.label;
                let labelStyle = {};
                let refY = 0;
                if (cfg.labelCfg) {
                    labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
                    refY += cfg.labelCfg.refY || 0;
                }
                let offsetY = 0;
                const fontSize = labelStyle.fontSize < 8 ? 8 : labelStyle.fontSize;
                const lineNum = cfg.labelLineNum || 1;
                offsetY = lineNum * (fontSize || 12);
                group.addShape('text', {
                    attrs: {
                        text,
                        x: 0,
                        y: r + refY + offsetY + 5,
                        textAlign: 'center',
                        textBaseLine: 'alphabetic',
                        cursor: 'pointer',
                        fontSize,
                        fill: '#fff',
                        opacity: 0.85,
                        fontWeight: 400,
                        stroke: global.edge.labelCfg.style.stroke,
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: 'text-shape',
                    className: 'text-shape',
                });
            }

            // tag for new node
            if (cfg.new) {
                group.addShape('circle', {
                    attrs: {
                        x: r - 3,
                        y: -r + 3,
                        r: 4,
                        fill: '#6DD400',
                        lineWidth: 0.5,
                        stroke: '#FFFFFF',
                    },
                    // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                    name: 'typeNode-tag-circle',
                });
            }

            return keyShape;
        },
        setState: (name, value, item) => {
            const group = item.get('group');
            if (name === 'layoutEnd' && value) {
                const labelShape = group.find((e) => e.get('name') === 'text-shape');
                if (labelShape) labelShape.set('visible', true);
            } else if (name === 'hover') {
                if (item.hasState('focus')) {
                    return;
                }
                const halo = group.find((e) => e.get('name') === 'halo-shape');
                const keyShape = item.getKeyShape();
                const colorSet = item.getModel().colorSet || colorSets[0];
                if (value) {
                    halo && halo.show();
                    keyShape.attr('fill', colorSet.activeFill);
                } else {
                    halo && halo.hide();
                    keyShape.attr('fill', colorSet.mainFill);
                }
            } else if (name === 'focus') {
                const stroke = group.find((e) => e.get('name') === 'stroke-shape');
                const label = group.find((e) => e.get('name') === 'text-shape');
                const keyShape = item.getKeyShape();
                const colorSet = item.getModel().colorSet || colorSets[0];
                if (value) {
                    stroke && stroke.show();
                    keyShape.attr('fill', colorSet.selectedFill);
                    label && label.attr('fontWeight', 800);
                } else {
                    stroke && stroke.hide();
                    keyShape.attr('fill', colorSet.mainFill); // '#2B384E'
                    label && label.attr('fontWeight', 400);
                }
            }
        },
        update: undefined,
    },
    '普通节点',
); // 这样可以继承 aggregated-node 的 setState


G6.registerEdge(
    'ClusterEdge', {
        setState: (name, value, item) => {
            const group = item.get('group');
            const model = item.getModel();
            if (name === 'focus') {
                const back = group.find((ele) => ele.get('name') === 'back-line');
                if (back) {
                    back.stopAnimate();
                    back.remove();
                    back.destroy();
                }
                const keyShape = group.find((ele) => ele.get('name') === 'edge-shape');
                const arrow = model.style.endArrow;
                if (value) {
                    if (keyShape.cfg.animation) {
                        keyShape.stopAnimate(true);
                    }
                    keyShape.attr({
                        strokeOpacity: animateOpacity,
                        opacity: animateOpacity,
                        stroke: '#fff',
                        endArrow: {
                            ...arrow,
                            stroke: '#fff',
                            fill: '#fff',
                        },
                    });
                    if (model.isReal) {
                        const { lineWidth, path, endArrow, stroke } = keyShape.attr();
                        const back = group.addShape('path', {
                            attrs: {
                                lineWidth,
                                path,
                                stroke,
                                endArrow,
                                opacity: animateBackOpacity,
                            },
                            // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                            name: 'back-line',
                        });
                        back.toBack();
                        const length = keyShape.getTotalLength();
                        keyShape.animate(
                            (ratio) => {
                                // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                                const startLen = ratio * length;
                                // Calculate the lineDash
                                const cfg = {
                                    lineDash: [startLen, length - startLen],
                                };
                                return cfg;
                            }, {
                                repeat: true, // Whether executes the animation repeatly
                                duration, // the duration for executing once
                            },
                        );
                    } else {
                        let index = 0;
                        const lineDash = keyShape.attr('lineDash');
                        const totalLength = lineDash[0] + lineDash[1];
                        keyShape.animate(
                            () => {
                                index++;
                                if (index > totalLength) {
                                    index = 0;
                                }
                                const res = {
                                    lineDash,
                                    lineDashOffset: -index,
                                };
                                // returns the modified configurations here, lineDash and lineDashOffset here
                                return res;
                            }, {
                                repeat: true, // whether executes the animation repeatly
                                duration, // the duration for executing once
                            },
                        );
                    }
                } else {
                    keyShape.stopAnimate();
                    const stroke = '#acaeaf';
                    const opacity = model.isReal ? realEdgeOpacity : virtualEdgeOpacity;
                    keyShape.attr({
                        stroke,
                        strokeOpacity: opacity,
                        opacity,
                        endArrow: {
                            ...arrow,
                            stroke,
                            fill: stroke,
                        },
                    });
                }
            }
        },
    },
    'quadratic',
);

// 普通节点边
G6.registerEdge(
    'NodeEdge', {
        setState: (name, value, item) => {
            const group = item.get('group');
            const model = item.getModel();
            if (name === 'focus') {
                const keyShape = group.find((ele) => ele.get('name') === 'edge-shape');
                const back = group.find((ele) => ele.get('name') === 'back-line');


                if (back) {
                    back.stopAnimate();
                    back.remove();
                    back.destroy();
                }
                const arrow = model.style.endArrow;
                if (value) {
                    if (keyShape.cfg.animation) {
                        keyShape.stopAnimate(true);
                    }
                    keyShape.attr({
                        strokeOpacity: animateOpacity,
                        opacity: animateOpacity,
                        stroke: '#fff',
                        endArrow: {
                            ...arrow,
                            stroke: '#fff',
                            fill: '#fff',
                        },
                    });
                    if (model.isReal) {
                        const { path, stroke, lineWidth } = keyShape.attr();
                        const back = group.addShape('path', {
                            attrs: {
                                path,
                                stroke,
                                lineWidth,
                                opacity: animateBackOpacity,
                            },
                            // must be assigned in G6 3.3 and later versions. it can be any string you want, but should be unique in a custom item type
                            name: 'back-line',
                        });
                        back.toBack();
                        const length = keyShape.getTotalLength();
                        keyShape.animate(
                            (ratio) => {
                                // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                                const startLen = ratio * length;
                                // Calculate the lineDash
                                const cfg = {
                                    lineDash: [startLen, length - startLen],
                                };
                                return cfg;
                            }, {
                                repeat: true, // Whether executes the animation repeatly
                                duration, // the duration for executing once
                            },
                        );
                    } else {
                        const lineDash = keyShape.attr('lineDash');
                        const totalLength = lineDash[0] + lineDash[1];
                        let index = 0;
                        keyShape.animate(
                            () => {
                                index++;
                                if (index > totalLength) {
                                    index = 0;
                                }
                                const res = {
                                    lineDash,
                                    lineDashOffset: -index,
                                };
                                // returns the modified configurations here, lineDash and lineDashOffset here
                                return res;
                            }, {
                                repeat: true, // whether executes the animation repeatly
                                duration, // the duration for executing once
                            },
                        );
                    }
                } else {
                    keyShape.stopAnimate();
                    const stroke = '#acaeaf';
                    const opacity = model.isReal ? realEdgeOpacity : virtualEdgeOpacity;
                    keyShape.attr({
                        stroke,
                        strokeOpacity: opacity,
                        opacity: opacity,
                        endArrow: {
                            ...arrow,
                            stroke,
                            fill: stroke,
                        },
                    });
                }
            }
        },
    },
    'single-edge',
);

const descendCompare = (p) => {
    // 这是比较函数
    return function(m, n) {
        const a = m[p];
        const b = n[p];
        return b - a; // 降序
    };
};

const clearFocusItemState = (graph) => {
    if (!graph) return;
    clearFocusNodeState(graph);
    clearFocusEdgeState(graph);
};

// 清除图上所有节点的 focus 状态及相应样式
const clearFocusNodeState = (graph) => {
    const focusNodes = graph.findAllByState('node', 'focus');
    focusNodes.forEach((fnode) => {
        graph.setItemState(fnode, 'focus', false); // false
    });
};

// 清除图上所有边的 focus 状态及相应样式
const clearFocusEdgeState = (graph) => {
    const focusEdges = graph.findAllByState('edge', 'focus');
    focusEdges.forEach((fedge) => {
        graph.setItemState(fedge, 'focus', false);
    });
};

// 截断长文本。length 为文本截断后长度，elipsis 是后缀
const formatText = (text, length = 5, elipsis = '...') => {
    if (!text) return '';
    if (text.length > length) {
        return `${text.substr(0, length)}${elipsis}`;
    }
    return text;
};

const labelFormatter = (text, minLength = 10) => {
    if (text && text.split('').length > minLength) return `${text.substr(0, minLength)}...`;
    return text;
};






const processNodesEdges = (
    nodes, // 节点列表
    edges, // 边列表
    width, // 图表宽度
    height, // 图表高度
    largeGraphMode, // 是否是大图模式
    edgeLabelVisible, // 是否展开边标签
    isNewGraph = false, // 是否是新图
) => {
    // 如果节点列表为空，则返回空对象
    if (!nodes || nodes.length === 0) return {};

    // 定义当前节点的映射表以及最大节点数
    const currentNodeMap = {};
    let maxNodeCount = -Infinity;

    // 定义一些常量
    const paddingRatio = 0.3;
    const paddingLeft = paddingRatio * width;
    const paddingTop = paddingRatio * height;


    // 对每个节点进行处理
    nodes.forEach((node) => {
        // 设置节点的类型和标签
        node.type = node.level === 0 ? '普通节点' : '聚合节点';
        node.isReal = node.level === 0 ? true : false;

        /*   node.labelLineNum = undefined; */

        node.degree = 0;
        node.inDegree = 0;
        node.outDegree = 0;

        // 防止节点id重复，如果节点id已存在，则在其后添加一个随机数
        if (currentNodeMap[node.id]) {
            console.warn('node exists already!', node.id);
            node.id = `${node.id}${Math.random()}`;
        }

        // 将节点加入当前节点映射表中
        currentNodeMap[node.id] = node;

        // 计算最大节点数
        if (node.count > maxNodeCount) maxNodeCount = node.count;

        // 如果已经有了缓存位置，则使用缓存位置
        const cachePosition = cachePositions ? cachePositions[node.id] : undefined;
        if (cachePosition) {
            node.x = cachePosition.x;
            node.y = cachePosition.y;
            node.new = false;
        } else {
            // 否则随机生成位置
            node.new = isNewGraph ? false : true;
            if (manipulatePosition && !node.x && !node.y) {
                node.x = manipulatePosition.x + 10 * Math.cos(Math.random() * Math.PI * 2);
                node.y = manipulatePosition.y + 10 * Math.sin(Math.random() * Math.PI * 2);
            }
        }
    });

    let maxCount = -Infinity;
    let minCount = Infinity;
    // let maxCount = 0;
    edges.forEach((edge) => {
        // to avoid the dulplicated id to nodes
        if (!edge.id) edge.id = uniqueId('edge');
        else if (edge.id.split('-')[0] !== 'edge') edge.id = `edge-${edge.id}`;
        // TODO: delete the following line after the queried data is correct
        if (!currentNodeMap[edge.source] || !currentNodeMap[edge.target]) {
            console.warn('edge source target does not exist', edge.source, edge.target, edge.id);
            return;
        }
        const sourceNode = currentNodeMap[edge.source];
        const targetNode = currentNodeMap[edge.target];

        if (!sourceNode || !targetNode)
            console.warn('source or target is not defined!!!', edge, sourceNode, targetNode);

        // calculate the degree
        sourceNode.degree++;
        targetNode.degree++;
        sourceNode.outDegree++;
        targetNode.inDegree++;

        if (edge.count > maxCount) maxCount = edge.count;
        if (edge.count < minCount) minCount = edge.count;
    });

    nodes.sort(descendCompare(NODESIZEMAPPING));
    const maxDegree = nodes[0].degree || 1;

    const descreteNodes = [];
    nodes.forEach((node) => {
        // assign the size mapping to the outDegree
        const countRatio = node.count / maxNodeCount;
        const isRealNode = node.level === 0;
        node.size = isRealNode ? (node.degree + 2) * 2 : node.count;
        node.isReal = isRealNode;
        node.labelCfg = {
            position: 'bottom',
            offset: 5,
            style: {
                fill: global.node.labelCfg.style.fill,
                fontSize: 6 + countRatio * 6 || 12,
                stroke: global.node.labelCfg.style.stroke,
                lineWidth: 3,
            },
        };

        if (!node.degree) {
            descreteNodes.push(node);
        }
    });

    const countRange = maxCount - minCount;
    const minEdgeSize = 1;
    const maxEdgeSize = 10;
    const edgeSizeRange = maxEdgeSize - minEdgeSize;
    edges.forEach((edge) => {
        // set edges' style
        const targetNode = currentNodeMap[edge.target];

        const size = ((edge.count - minCount) / countRange) * edgeSizeRange + minEdgeSize || 1;
        edge.size = size;

        const arrowWidth = Math.max(size / 2 + 2, 3);
        const arrowLength = 10;
        const arrowBeging = targetNode.size + arrowLength;
        let arrowPath = `M ${arrowBeging},0 L ${arrowBeging + arrowLength},-${arrowWidth} L ${arrowBeging + arrowLength
            },${arrowWidth} Z`;
        let d = targetNode.size / 2 + arrowLength;
        if (edge.source === edge.target) {
            edge.type = 'loop';
            arrowPath = undefined;
        }
        const sourceNode = currentNodeMap[edge.source];
        const isRealEdge = targetNode.isReal && sourceNode.isReal;
        edge.isReal = isRealEdge;
        const stroke = isRealEdge ? global.edge.style.realEdgeStroke : global.edge.style.stroke;
        const opacity = isRealEdge ?
            global.edge.style.realEdgeOpacity :
            global.edge.style.strokeOpacity;
        const dash = Math.max(size, 2);
        const lineDash = isRealEdge ? undefined : [dash, dash];
        edge.style = {
            stroke,
            strokeOpacity: opacity,
            cursor: 'pointer',
            lineAppendWidth: Math.max(edge.size || 5, 5),
            fillOpacity: 1,
            lineDash,
            endArrow: arrowPath ? {
                path: arrowPath,
                d,
                fill: stroke,
                strokeOpacity: 0,
            } : false,
        };
        edge.labelCfg = {
            autoRotate: true,
            style: {
                stroke: global.edge.labelCfg.style.stroke,
                fill: global.edge.labelCfg.style.fill,
                lineWidth: 4,
                fontSize: 12,
                lineAppendWidth: 10,
                opacity: 1,
            },
        };
        if (!edge.orilabel) edge.orilabel = edge.label;
        if (largeGraphMode || !edgeLabelVisible) edge.label = '';
        else {
            edge.label = labelFormatter(edge.label, labelMaxLength);
        }

        // arrange the other nodes around the hub
        const sourceDis = sourceNode.size / 2 + 20;
        const targetDis = targetNode.size / 2 + 20;
        if (sourceNode.x && !targetNode.x) {
            targetNode.x = sourceNode.x + sourceDis * Math.cos(Math.random() * Math.PI * 2);
        }
        if (sourceNode.y && !targetNode.y) {
            targetNode.y = sourceNode.y + sourceDis * Math.sin(Math.random() * Math.PI * 2);
        }
        if (targetNode.x && !sourceNode.x) {
            sourceNode.x = targetNode.x + targetDis * Math.cos(Math.random() * Math.PI * 2);
        }
        if (targetNode.y && !sourceNode.y) {
            sourceNode.y = targetNode.y + targetDis * Math.sin(Math.random() * Math.PI * 2);
        }

        if (!sourceNode.x && !sourceNode.y && manipulatePosition) {
            sourceNode.x = manipulatePosition.x + 30 * Math.cos(Math.random() * Math.PI * 2);
            sourceNode.y = manipulatePosition.y + 30 * Math.sin(Math.random() * Math.PI * 2);
        }
        if (!targetNode.x && !targetNode.y && manipulatePosition) {
            targetNode.x = manipulatePosition.x + 30 * Math.cos(Math.random() * Math.PI * 2);
            targetNode.y = manipulatePosition.y + 30 * Math.sin(Math.random() * Math.PI * 2);
        }
    });

    descreteNodeCenter = {
        x: width - paddingLeft,
        y: height - paddingTop,
    };
    descreteNodes.forEach((node) => {
        if (!node.x && !node.y) {
            node.x = descreteNodeCenter.x + 30 * Math.cos(Math.random() * Math.PI * 2);
            node.y = descreteNodeCenter.y + 30 * Math.sin(Math.random() * Math.PI * 2);
        }
    });

    G6.Util.processParallelEdges(edges, 12.5, 'ClusterEdge', 'NodeEdge');
    return {
        maxDegree,
        edges,
    };
};

/**
 * 获取 Force 布局的配置信息
 * @param graph - G6 图实例对象
 * @param largeGraphMode - 是否是大数据量模式
 * @param configSettings - 配置项
 * @returns {Object} Force 布局的配置对象
 */
const getForceLayoutConfig = (graph, largeGraphMode, configSettings) => {
    // 解构出配置项中的参数
    let {
        linkDistance,
        edgeStrength,
        nodeStrength,
        nodeSpacing,
        preventOverlap,
        nodeSize,
        collideStrength,
        alpha,
        alphaDecay,
        alphaMin,
    } = configSettings || { preventOverlap: true };

    // 若参数未设置，设置默认值
    if (!linkDistance && linkDistance !== 0) linkDistance = 150;
    if (!edgeStrength && edgeStrength !== 0) edgeStrength = 40;
    if (!nodeStrength && nodeStrength !== 0) nodeStrength = 200;
    if (!nodeSpacing && nodeSpacing !== 0) nodeSpacing = 5;

    // Force 布局配置项
    const config = {
        type: 'gForce',
        minMovement: 0.01,
        maxIteration: 2000,
        preventOverlap,
        nodeSize: 100,
        damping: 0.99,
        linkDistance: (d) => {
            let dist = linkDistance;
            const sourceNode = nodeMap[d.source] || aggregatedNodeMap[d.source];
            const targetNode = nodeMap[d.target] || aggregatedNodeMap[d.target];
            //若两端都是聚合点
            if (sourceNode.level && targetNode.level) dist = linkDistance * 3;
            // 若一端是聚合点，一端是真实节点
            else if (sourceNode.level || targetNode.level) dist = linkDistance * 1.5;
            if (!sourceNode.level && !targetNode.level) dist = linkDistance * 0.3;
            return dist;
        },
        edgeStrength: (d) => {
            const sourceNode = nodeMap[d.source] || aggregatedNodeMap[d.source];
            const targetNode = nodeMap[d.target] || aggregatedNodeMap[d.target];
            // 聚合节点之间的引力小
            if (sourceNode.level && targetNode.level) return edgeStrength;
            // 聚合节点与真实节点之间引力大
            if (sourceNode.level || targetNode.level) return edgeStrength * 2;
            return edgeStrength;
        },
        nodeStrength: (d) => {

            if (d.degree === 1) return 100;
            if (d.category === '产业') return nodeStrength * 3;
            if (d.level) return nodeStrength * 15;
            return nodeStrength;
        },
        /*   nodeSize: (d) => {
              if (!nodeSize && d.size) return d.size;
             
          }, */
        nodeSpacing: (d) => {

            if (d.degree === 0) return nodeSpacing * 2;
            if (d.level) return 400;
            return nodeSpacing;

        },
        // 布局结束后的回调函数
        onLayoutEnd: () => {
            if (largeGraphMode) {
                graph.getEdges().forEach((edge) => {
                    if (!edge.orilabel) return;
                    edge.update({
                        label: labelFormatter(edge.orilabel, labelMaxLength),
                    });
                });
            }
        },
        tick: () => {
            graph.refreshPositions();
        },
    };

    if (nodeSize) config['nodeSize'] = nodeSize;
    if (collideStrength) config['collideStrength'] = collideStrength;
    if (alpha) config['alpha'] = alpha;
    if (alphaDecay) config['alphaDecay'] = alphaDecay;
    if (alphaMin) config['alphaMin'] = alphaMin;

    return config;
};

const hideItems = (graph) => {
    hiddenItemIds.forEach((id) => {
        graph.hideItem(id);
    });
};

const showItems = (graph) => {
    graph.getNodes().forEach((node) => {
        if (!node.isVisible()) graph.showItem(node);
    });
    graph.getEdges().forEach((edge) => {
        if (!edge.isVisible()) edge.showItem(edge);
    });
    hiddenItemIds = [];
};

// 定义 handleRefreshGraph 函数，更新 Graphin 实例中的图数据
const handleRefreshGraph = (
    graph, // Graphin 实例对象
    graphData, // 更新后的图数据
    width, // Graphin 实例宽度
    height, // Graphin 实例高度
    largeGraphMode, // 是否开启大规模图模式
    edgeLabelVisible, // 边标签是否可见
    isNewGraph, // 是否是新的图数据
) => {
    // 如果图数据或 Graphin 实例不存在，则直接返回
    if (!graphData || !graph) return;
    // 清除所有节点和边的焦点状态
    clearFocusItemState(graph);
    // 重置过滤
    graph.getNodes().forEach((node) => {
        if (!node.isVisible()) node.show();
    });
    graph.getEdges().forEach((edge) => {
        if (!edge.isVisible()) edge.show();
    });

    let nodes = [],
        edges = [];

    // 将更新后的图数据中的节点数据赋值给 nodes 变量
    nodes = graphData.nodes;
    // 对节点和边进行处理
    const processRes = processNodesEdges(
        nodes,
        graphData.edges || [],
        width,
        height,
        largeGraphMode,
        edgeLabelVisible,
        isNewGraph,
    );
    // 将处理后的边数据赋值给 edges 变量
    edges = processRes.edges;

    // 更新 Graphin 实例中的图数据
    graph.changeData({ nodes, edges });

    // 隐藏所有节点和边
    hideItems(graph);
    // 将所有节点移到前面
    graph.getNodes().forEach((node) => {
        node.toFront();
    });

    // 初始化布局
    layout.instance.init({
        nodes: graphData.nodes, // 节点数据
        edges, // 边数据
    });

    // 设置布局参数
    layout.instance.minMovement = 0.0001;
    layout.instance.getMass = (d) => {
        const cachePosition = cachePositions[d.id];
        if (cachePosition) return 5;
        return 1;
    };

    // 执行布局算法
    layout.instance.execute();
    // 返回更新后的节点和边数据
    return { nodes, edges };
};

/**
 * 根据聚合数据和原始数据生成节点和边数据
 * @param {Object} aggregatedData 聚合数据
 * @param {Object} originData 原始数据
 * @param {Object} nodeMap 节点映射表
 * @param {Object} aggregatedNodeMap 聚合节点映射表
 * @param {Array} expandArray 展开数组
 * @param {Array} collapseArray 收缩数组
 * @returns {Object} 包含节点和边数据的对象
 */
const getMixedGraph = (
    aggregatedData,
    originData,
    nodeMap,
    aggregatedNodeMap,
    expandArray,
    collapseArray,
) => {
    let nodes = [],
        edges = [];

    const expandMap = {}, // 存储展开数组的映射表
        collapseMap = {}; // 存储收缩数组的映射表
    expandArray.forEach((expandModel) => {
        expandMap[expandModel.id] = true;
    });
    collapseArray.forEach((collapseModel) => {
        collapseMap[collapseModel.id] = true;
    });

    // 遍历聚合数据中的每个聚类，根据展开和收缩数组将节点分为两类
    aggregatedData.clusters.forEach((cluster, i) => {
        if (expandMap[cluster.id]) { // 如果当前聚类在展开数组中，将其节点全部加入 nodes 数组
            nodes = nodes.concat(cluster.nodes);
            aggregatedNodeMap[cluster.id].expanded = true; // 更新聚合节点映射表中该聚类的展开状态为 true
        } else { // 否则将聚合节点本身加入 nodes 数组
            nodes.push(aggregatedNodeMap[cluster.id]);
            aggregatedNodeMap[cluster.id].expanded = false; // 更新聚合节点映射表中该聚类的展开状态为 false
        }
    });
    originData.edges.forEach((edge) => {
        const isSourceInExpandArray = expandMap[nodeMap[edge.source].clusterId];
        const isTargetInExpandArray = expandMap[nodeMap[edge.target].clusterId];
        if (isSourceInExpandArray && isTargetInExpandArray) {
            edges.push(edge);
        } else if (isSourceInExpandArray) {
            const targetClusterId = nodeMap[edge.target].clusterId;
            const vedge = {
                source: edge.source,
                target: targetClusterId,
                id: uniqueId('edge'),
                label: '',
            };
            edges.push(vedge);
        } else if (isTargetInExpandArray) {
            const sourceClusterId = nodeMap[edge.source].clusterId;
            const vedge = {
                target: edge.target,
                source: sourceClusterId,
                id: uniqueId('edge'),
                label: '',
            };
            edges.push(vedge);
        }
    });
    aggregatedData.clusterEdges.forEach((edge) => {
        if (expandMap[edge.source] || expandMap[edge.target]) return;
        else edges.push(edge);
    });

    return { nodes, edges };

};




const examAncestors = (model, expandedArray, length, keepTags) => {
    for (let i = 0; i < length; i++) {
        const expandedNode = expandedArray[i];
        if (!keepTags[i] && model.parentId === expandedNode.id) {
            keepTags[i] = true; // 需要被保留
            examAncestors(expandedNode, expandedArray, length, keepTags);
            break;
        }
    }
};

const manageExpandCollapseArray = (nodeNumber, model, collapseArray, expandArray) => {
    manipulatePosition = { x: model.x, y: model.y };

    // 维护 expandArray，若当前画布节点数高于上限，移出 expandedArray 中非 model 祖先的节点)
    if (nodeNumber > NODE_LIMIT) {
        // 若 keepTags[i] 为 true，则 expandedArray 的第 i 个节点需要被保留
        const keepTags = {};
        const expandLen = expandArray.length;
        // 检查 X 的所有祖先并标记 keepTags
        examAncestors(model, expandArray, expandLen, keepTags);
        // 寻找 expandedArray 中第一个 keepTags 不为 true 的点
        let shiftNodeIdx = -1;
        for (let i = 0; i < expandLen; i++) {
            if (!keepTags[i]) {
                shiftNodeIdx = i;
                break;
            }
        }
        // 如果有符合条件的节点，将其从 expandedArray 中移除
        if (shiftNodeIdx !== -1) {
            let foundNode = expandArray[shiftNodeIdx];
            if (foundNode.level === 2) {
                let foundLevel1 = false;
                // 找到 expandedArray 中 parentId = foundNode.id 且 level = 1 的第一个节点
                for (let i = 0; i < expandLen; i++) {
                    const eNode = expandArray[i];
                    if (eNode.parentId === foundNode.id && eNode.level === 1) {
                        foundLevel1 = true;
                        foundNode = eNode;
                        expandArray.splice(i, 1);
                        break;
                    }
                }
                // 若未找到，则 foundNode 不变, 直接删去 foundNode
                if (!foundLevel1) expandArray.splice(shiftNodeIdx, 1);
            } else {
                // 直接删去 foundNode
                expandArray.splice(shiftNodeIdx, 1);
            }
            // const removedNode = expandedArray.splice(shiftNodeIdx, 1); // splice returns an array
            const idSplits = foundNode.id.split('-');
            let collapseNodeId;
            // 去掉最后一个后缀
            for (let i = 0; i < idSplits.length - 1; i++) {
                const str = idSplits[i];
                if (collapseNodeId) collapseNodeId = `${collapseNodeId}-${str}`;
                else collapseNodeId = str;
            }
            const collapseNode = {
                id: collapseNodeId,
                parentId: foundNode.id,
                level: foundNode.level - 1,
            };
            collapseArray.push(collapseNode);
        }
    }

    const currentNode = {
        id: model.id,
        level: model.level,
        parentId: model.parentId,
    };

    // 加入当前需要展开的节点
    expandArray.push(currentNode);

    graph.get('canvas').setCursor('default');
    return { expandArray, collapseArray };
};

const cacheNodePositions = (nodes) => {
    const positionMap = {};
    const nodeLength = nodes.length;
    for (let i = 0; i < nodeLength; i++) {
        const node = nodes[i].getModel();
        positionMap[node.id] = {
            x: node.x,
            y: node.y,
            level: node.level,
        };
    }
    return positionMap;
};

const stopLayout = () => {
    layout.instance.stop();
};

const bindListener = (graph) => {
    graph.on('keydown', (evt) => {
        const code = evt.key;
        if (!code) {
            return;
        }
        if (code.toLowerCase() === 'shift') {
            shiftKeydown = true;
        } else {
            shiftKeydown = false;
        }
    });
    graph.on('keyup', (evt) => {
        const code = evt.key;
        if (!code) {
            return;
        }
        if (code.toLowerCase() === 'shift') {
            shiftKeydown = false;
        }
    });
    graph.on('node:mouseenter', (evt) => {
        const { item } = evt;
        const model = item.getModel();
        const currentLabel = model.label;
        model.oriFontSize = model.labelCfg.style.fontSize;
        item.update({
            label: model.orilabel,
        });

        model.orilabel = currentLabel;

        graph.setItemState(item, 'hover', true);
        item.toFront();
    });

    graph.on('node:mouseleave', (evt) => {
        const { item } = evt;
        const model = item.getModel();
        const currentLabel = model.label;
        item.update({
            label: model.orilabel,
        });
        model.orilabel = currentLabel;



        graph.setItemState(item, 'hover', false);
    });

    graph.on('edge:mouseenter', (evt) => {
        const { item } = evt;
        const model = item.getModel();
        const currentLabel = model.label;
        item.update({
            label: model.orilabel,
        });
        model.orilabel = currentLabel;
        item.toFront();
        item.getSource().toFront();
        item.getTarget().toFront();

    });

    graph.on('edge:mouseleave', (evt) => {
        const { item } = evt;
        const model = item.getModel();
        const currentLabel = model.label;
        item.update({
            label: model.orilabel,
        });
        model.orilabel = currentLabel;
    });
    graph.on('node:click', (evt) => {
        stopLayout();
        if (!shiftKeydown) clearFocusItemState(graph);
        else clearFocusEdgeState(graph);
        const { item } = evt;

        // highlight the clicked node, it is down by click-select
        graph.setItemState(item, 'focus', true);

        if (!shiftKeydown) {
            // 将相关边也高亮
            const relatedEdges = item.getEdges();
            relatedEdges.forEach((edge) => {
                graph.setItemState(edge, 'focus', true);


            });

            // 将相关节点也高亮
            const relatedNodes = item.getNeighbors().filter(node => node.getModel().level === 0);


            relatedNodes.forEach((node) => {

                graph.setItemState(node, 'focus', true);
            });
        }
    });


    // click edge to show the detail of integrated edge drawer
    graph.on('edge:click', (evt) => {
        stopLayout();
        if (!shiftKeydown) clearFocusItemState(graph);
        const { item } = evt;
        // highlight the clicked edge
        graph.setItemState(item, 'focus', true);
    });

    // click canvas to cancel all the focus state
    graph.on('canvas:click', (evt) => {
        clearFocusItemState(graph);
        console.log(graph.getGroup(), graph.getGroup().getBBox(), graph.getGroup().getCanvasBBox());

    });
};


const subjectMap = {
    '产业': 0,
    '技术': 1,
    '企业': 2,
    '专利': 3,
    '产品': 4,
    '聚合节点': 5
};



const industryToClusterId = {
    "原材料": 'cluster1',
    '组件': 'cluster2',
    "整车": 'cluster3',
    '市场服务': 'cluster4',
    undefined: '未定义'
};
const clusterIdToIndustry = {};
for (const industry in industryToClusterId) {
    const clusterId = industryToClusterId[industry];
    clusterIdToIndustry[clusterId] = industry;
}

function clusterByIndustry(data) {
    const industryMap = new Map();
    data.nodes.forEach(node => {
        const industry = node.belongsto;
        if (!industryMap.has(industry)) {
            const clusterId = `cluster${industryMap.size + 1}`;
            industryMap.set(industry, { id: clusterId, sumTot: 0, nodes: [] });
        }
        const cluster = industryMap.get(industry);
        cluster.nodes.push({...node, clusterId: cluster.id });
        cluster.sumTot++;
    });

    const clusters = Array.from(industryMap.values());
    const clusterEdges = [];
    const edgeMap = new Map();

    data.edges.forEach((edge) => {
        const sourceNode = data.nodes.find((node) => node.id === edge.source);
        const targetNode = data.nodes.find((node) => node.id === edge.target);

        const sourceClusterId = industryToClusterId[sourceNode.belongsto];
        const targetClusterId = industryToClusterId[targetNode.belongsto];
        const edgeKey = `${sourceClusterId}-${targetClusterId}`;
        const reverseEdgeKey = `${targetClusterId}-${sourceClusterId}`;

        if (edgeMap.has(edgeKey)) {
            const edge = edgeMap.get(edgeKey);
            edge.count += 1;
        } else if (edgeMap.has(reverseEdgeKey)) {
            const edge = edgeMap.get(reverseEdgeKey);
            edge.count += 1;
        } else {
            edgeMap.set(edgeKey, { source: sourceClusterId, target: targetClusterId, count: 1 });
        }
    });

    clusterEdges.push(...edgeMap.values());

    return { clusters, clusterEdges };
}

const filenames = ['./data/industries.json', './data/enterprises.json', 'data/tech_words.json', 'data/industries_to_techwords.json', './data/industries_to_industries.json', './data/industries_to_enterprises.json', 'data/techwords_to_industries.json'];
const getNeighborMixedGraph = (
    centerNodeModel,
    neighborType,
    originData,
    clusteredData,
    currentData,
    nodeMap,
    aggregatedNodeMap,
    maxNeighborNumPerNode,
) => {
    // update the manipulate position for center gravity of the new nodes
    manipulatePosition = { x: centerNodeModel.x, y: centerNodeModel.y };

    // the neighborSubGraph does not include the centerNodeModel. the elements are all generated new nodes and edges


    const neighborSubGraph = generateNeighbors(centerNodeModel, maxNeighborNumPerNode, neighborType);
    console.log(neighborSubGraph)
        // update the origin data
    originData.nodes = originData.nodes.concat(neighborSubGraph.nodes);
    originData.edges = originData.edges.concat(neighborSubGraph.edges);
    // update the origin nodeMap
    neighborSubGraph.nodes.forEach((node) => {
        nodeMap[node.id] = node;
    });
    // update the clusteredData
    const clusterId = centerNodeModel.clusterId;
    clusteredData.clusters.forEach((cluster) => {
        if (cluster.id !== clusterId) return;
        cluster.nodes = cluster.nodes.concat(neighborSubGraph.nodes);
        cluster.sumTot += neighborSubGraph.edges.length;
    });
    // update the count
    aggregatedNodeMap[clusterId].count += neighborSubGraph.nodes.length;

    // Filter out the nodes that already exist in the currentData
    const newNodes = neighborSubGraph.nodes.filter((node) => !currentData.nodes.some((n) => n.id === node.id));
    const newEdges = neighborSubGraph.edges.filter((edge) => !currentData.edges.some((n) => n.id === edge.id));;

    currentData.nodes = currentData.nodes.concat(newNodes);
    currentData.edges = currentData.edges.concat(newEdges);
    return currentData;
};


/**
 * 生成邻居节点
 * @param {Object} centerNodeModel 中心节点对象    
 * @param {number} maxNeighborNumPerNode 每个节点最多的邻居节点数量
 * @param {string} type 生成节点的类型
 * @returns {Object} 生成的节点和边对象
 */
const generateNeighbors = (centerNodeModel, maxNeighborNumPerNode = 10, category) => {
    // 如果层数小于等于 0，则返回 undefined
    let generatedData = null;


    if (generatedData) {
        return generatedData;
    }
    // 初始化节点数组和边数组
    let nodes = [],
        edges = [];
    // 获取中心节点的簇 ID 和 ID
    const clusterId = centerNodeModel.clusterId;
    const centerId = centerNodeModel.id;
    // 随机生成邻居节点的数量
    const neighborNum = Math.ceil(Math.random() * maxNeighborNumPerNode);
    // 循环生成技术邻居节点

    for (let i = 0; i < neighborNum; i++) {
        // 定义一个新的邻居节点，并设置属性
        const neighborNode = {
            id: category === '专利' ? generateRandomPatentName() : products[Math.floor(Math.random() * products.length)],
            clusterId,
            level: 0,
            category: category,

            colorSet: category === '专利' ? colorSets[3] : colorSets[4],

        };

        // 将新的邻居节点添加到节点数组中
        nodes.push(neighborNode);
        nodes.forEach((node) => {
                node.orilabel = node.id;
                node.label = labelFormatter(node.orilabel, 5);
            })
            // 随机生成边的方向

        // 根据方向设置边的起点和终点
        const source = centerId;
        const target = neighborNode.id;
        // 定义一条新的边，并设置属性
        const neighborEdge = {
            id: `${source}-${target}`, // 通过 uniqueId 函数生成唯一 ID
            source,
            target,
            label: centerNodeModel.category === '技术' ? "相关专利" : "主营产品",
        };
        // 将新的边添加到边数组中
        edges.push(neighborEdge);


    }

    // 返回生成的节点数组和边数组
    return { nodes, edges };
};

Promise.all(filenames.map(filename => fetch(filename).then(response => response.json())))
    .then(dataArr => {
        const data = dataArr.reduce((acc, data) => {
            if (data.nodes) {
                acc.nodes.push(...data.nodes);
            }
            if (data.edges) {
                acc.edges.push(...data.edges);
            }
            return acc;
        }, { nodes: [], edges: [] });
        const stats = {
            industry: 0,
            technology: 0,
            enterprise: 0
        };
        data.nodes.forEach((node) => {
            switch (node.category) {
                case '产业':
                    stats.industry += 1;
                    break;
                case '技术':
                    stats.technology += 1;
                    break;
                case '企业':
                    stats.enterprise += 1;
                    break;
                default:
                    break;
            }
        });
        const typeConfigs = {
            'indus': {
                type: 'circle',
                size: 20,
                style: {
                    fill: '#0f63a9',
                    stroke: '#0f63a9',
                    lineWidth: 2,
                    opacity: 0.5,

                }
            },
            'technology': {
                type: 'circle',
                size: 20,
                style: {
                    fill: '#eb4d4b',
                    stroke: '#eb4d4b',
                    lineWidth: 2,
                    opacity: 0.5,
                    stoke: '#dff9fb'
                }
            },
            'enterprise': {
                type: 'circle',
                size: 20,
                style: {
                    fill: 'rgba(251, 197, 49,1.0)',
                    stroke: 'rgba(251, 197, 49,1.0)',
                    lineWidth: 2,
                    opacity: 0.5
                }
            },
            'patent': {
                type: 'circle',
                size: 20,
                style: {
                    fill: '#91cc75',
                    stroke: '#91cc75',
                    lineWidth: 2,
                    opacity: 0.5
                }
            },
            'product': {
                type: 'circle',
                size: 20,
                style: {
                    fill: ' rgba(156, 136, 255,1.0)',
                    stroke: 'rgba(156, 136, 255,1.0)',
                    lineWidth: 2,
                    opacity: 0.5
                }
            },


        }

        const legendData = {
            nodes: [{
                    id: 'indus',
                    label: `产业：${stats.industry + 48}`,

                    ...typeConfigs['indus']
                },
                {
                    id: 'technology',
                    label: `技术：${stats.technology + 300}`,

                    ...typeConfigs['technology']
                }, {
                    id: 'enterprise',
                    label: `企业：${stats.enterprise + 300}`,

                    ...typeConfigs['enterprise']
                }, {
                    id: 'patent',
                    label: '专利：589',

                    ...typeConfigs['patent']
                },
                {
                    id: 'product',
                    label: '产品：487',

                    ...typeConfigs['product']
                },


            ],
        }

        const legend = new G6.Legend({
            data: legendData,
            align: 'center',
            layout: 'vertical', // vertical
            position: 'right-top',
            vertiSep: 5,
            horiSep: 5,
            margin: 5,
            offsetX: 2,
            offsetY: 1,
            padding: 16,

            containerStyle: {
                fill: 'rgba(220, 221, 225,0.5)',
                opacity: 0.8,
                lineWidth: 1,
                radius: 30,

            },

            title: '图例',
            titleConfig: {
                position: 'center',
                offsetX: 5,
                offsetY: 10,

            },

            filter: {
                enable: true,
                multiple: true,
                trigger: 'click',
                graphActiveState: 'focus',

                filterFunctions: {
                    'technology': (d) => {
                        if (d.category === '技术') return true;
                        return false
                    },
                    'enterprise': (d) => {
                        if (d.category === '企业') return true;
                        return false
                    },
                    'patent': (d) => {
                        if (d.category === '专利') return true;
                        return false
                    },
                    'indus': (d) => {
                        if (d.category === '产业') return true;
                        return false
                    },

                }
            }
        });

        // console.log(stats)

        const container = document.getElementById('container');


        container.style.backgroundColor = '#2b2f33';

        CANVAS_WIDTH = container.scrollWidth - 20;
        CANVAS_HEIGHT = (container.scrollHeight || 600) - 10;

        nodeMap = {};
        // 使用louvain算法对数据进行聚类，将结果存储到clusteredData中
        /* const clusteredData = louvain(data, false, 'count'); */
        const clusteredData = clusterByIndustry(data)

        // 初始化一个聚合后的数据对象aggregatedData
        const aggregatedData = { nodes: [], edges: [] };

        // 遍历每个聚类，并将其中的节点加入到aggregatedData中
        clusteredData.clusters.forEach((cluster, i) => {
            // 遍历聚类中的每个节点
            cluster.nodes.forEach((node) => {
                // 对每个节点设置属性
                node.level = 0;
                node.orilabel = node.id;

                node.label = formatText(node.orilabel, labelMaxLength, '...');

                node.colorSet = colorSets[subjectMap[node.category]];
                // 将节点对象存储到nodeMap中，key为节点id
                nodeMap[node.id] = node;
                node.isExpanded = false;
                node.isNeighborShowed = false;
            });
            // 生成聚类产业节点inode
            const inode = {
                id: cluster.id,
                category: '聚合节点',
                count: cluster.nodes.length,
                level: 1,
                orilabel: clusterIdToIndustry[cluster.id],
                label: clusterIdToIndustry[cluster.id],
                colorSet: colorSets[subjectMap['聚合节点']],
                idx: i,
            };


            // 将聚类节点对象存储到aggregatedNodeMap中，key为聚类id
            aggregatedNodeMap[cluster.id] = inode;
            // 将聚类节点对象存储到aggregatedData的节点数组中
            aggregatedData.nodes.push(inode);

        });

        // 遍历聚类边，并将其加入到aggregatedData中
        clusteredData.clusterEdges.forEach((clusterEdge) => {
            // 生成聚类边对象cedge
            const cedge = {
                ...clusterEdge,
                size: Math.log(clusterEdge.count),
                label: '',
                id: uniqueId('edge'),
            };
            // 判断是否为环
            if (cedge.source === cedge.target) {
                cedge.type = 'loop';
                cedge.loopCfg = {
                    dist: 20,
                };
            } else {
                // 如果不是环，则设置为线性
                cedge.type = 'line';
            }
            // 将聚类边对象存储到aggregatedData的边数组中
            aggregatedData.edges.push(cedge);
        });

        // 对原始数据的边进行操作，设置label和id属性
        data.edges.forEach((edge) => {

            edge.id = `${edge.source}-${edge.target}`;
        });

        // 将聚合后的数据对象赋值给currentUnproccessedData
        currentUnproccessedData = aggregatedData;

        // 处理节点和边的位置，以适应当前画布大小
        const { edges: processedEdges } = processNodesEdges(
            currentUnproccessedData.nodes,
            currentUnproccessedData.edges,
            CANVAS_WIDTH,
            CANVAS_HEIGHT,
            largeGraphMode,
            true,
            true,
        );

        const contextMenu = new G6.Menu({
            shouldBegin(evt) {
                if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) return true;
                if (evt.item) return true;
                return false;
            },
            getContent(evt) {
                const { item } = evt;
                if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
                    return `<ul>
          <li id='show'>显示所有隐藏节点</li>
          <li id='collapseAll'>折叠所有节点</li>
        </ul>`;
                } else if (!item) return;
                const itemType = item.getType();
                const model = item.getModel();
                // console.log(model);
                if (itemType && model) {
                    if (itemType === 'node') {
                        let html = `<ul>
                        
                            <li id='hide'>隐藏该节点</li>
                          </ul>`;
                        if (model.level !== 0) {
                            html += `<ul>
                            <li id='expand'>展开相关节点</li>
                           
                          </ul>`
                            return html
                        } else {
                            let expandCollapseMenu;
                            html += `<ul>
                            <li id='collapse'>收缩该节点</li>
                               
                              </ul>`;

                            if (model.category === "技术") {


                                if (!model.isExpanded) {

                                    html += `<ul>
                                    <li id='neighbor-展开'>展开相关专利</li>
                                   </ul>`;;



                                } else html += `<ul>
                                  <li id='neighbor-收缩'>收缩相关专利</li>
                                 </ul>`;;

                                return html;
                            }
                            if (model.category === "企业") {

                                if (!model.isExpanded) {
                                    html += `<ul>
                                    <li id='neighbor-展开'>展开相关产品</li>
                                   </ul>`;;
                                } else html += `<ul>
                                <li id='neighbor-收缩'>收缩相关产品</li>
                               </ul>`;;

                                return html;
                            } else {

                                return `<ul>
                            <li id='collapse'>收缩节点</li>
                            <li id='hide'>隐藏该节点</li>
                          </ul>`;
                            }
                        }
                    } else {
                        return `<ul>
            <li id='hide'>隐藏该边</li>
          </ul>`;
                    }
                }
            },

            handleMenuClick: (target, item) => {
                const model = item && item.getModel();
                const liIdStrs = target.id.split('-');
                let mixedGraphData;
                switch (liIdStrs[0]) {
                    case 'return':
                        graph.getNodes().forEach((item) => {
                            if (item.getModel().id !== model.id) {
                                if (item.getModel().category === '技术') graph.showItem(item);
                                else {
                                    graph.hideItem(item);
                                    hiddenItemIds.push(model.id);
                                }
                            }
                        });
                    case 'hide':
                        graph.hideItem(item);
                        hiddenItemIds.push(model.id);
                        break;
                    case 'expand':

                        const newArray = manageExpandCollapseArray(
                            graph.getNodes().length,
                            model,
                            collapseArray,
                            expandArray,
                        );
                        expandArray = newArray.expandArray;
                        collapseArray = newArray.collapseArray;

                        mixedGraphData = getMixedGraph(
                            clusteredData,
                            data,
                            nodeMap,
                            aggregatedNodeMap,
                            expandArray,
                            collapseArray,
                        );

                        break;
                    case 'collapse':
                        const aggregatedNode = aggregatedNodeMap[model.clusterId];

                        manipulatePosition = { x: aggregatedNode.x, y: aggregatedNode.y };
                        collapseArray.push(aggregatedNode);
                        showItems(graph);
                        for (let i = 0; i < expandArray.length; i++) {
                            if (expandArray[i].id === model.clusterId) {
                                expandArray.splice(i, 1);
                                break;
                            }
                        }
                        mixedGraphData = getMixedGraph(
                            clusteredData,
                            data,
                            nodeMap,
                            aggregatedNodeMap,
                            expandArray,
                            collapseArray,
                        );
                        break;
                    case 'collapseAll':
                        expandArray = [];
                        collapseArray = [];
                        mixedGraphData = getMixedGraph(
                            clusteredData,
                            data,
                            nodeMap,
                            aggregatedNodeMap,
                            expandArray,
                            collapseArray,
                        );
                        showItems(graph);
                        break;
                    case 'neighbor':
                        const neighborNodes = item.getNeighbors();
                        const expandNeighborType = model.category === '技术' ? '专利' : '产品';
                        if (model.isNeighborShowed === false)

                            mixedGraphData = getNeighborMixedGraph(
                            model,
                            expandNeighborType,
                            data,
                            clusteredData,
                            currentUnproccessedData,
                            nodeMap,
                            aggregatedNodeMap,
                            10,
                        );
                        model.isNeighborShowed = true;
                        if (liIdStrs[1] === '展开') {
                            neighborNodes.forEach((item) => {
                                if (item.getModel().category !== '产业') {
                                    graph.showItem(item);

                                }
                            })


                        } else if (liIdStrs[1] === '收缩') {

                            console.log(neighborNodes);
                            neighborNodes.forEach((item) => {
                                if (item.getModel().category !== '产业') {
                                    graph.hideItem(item);
                                    hiddenItemIds.push(item.getModel().id);
                                }
                            })

                        }
                        graph.getNodes().forEach((item) => {
                            if (item.getModel().level) {
                                if (item.getModel().id !== model.id) {
                                    graph.hideItem(item);
                                    hiddenItemIds.push(item.getModel().id);
                                }
                            }
                        });





                        model.isExpanded = !model.isExpanded;




                        break;
                    case 'show':
                        showItems(graph);



                        break;
                    default:
                        break;
                }
                if (mixedGraphData) {
                    cachePositions = cacheNodePositions(graph.getNodes());
                    currentUnproccessedData = mixedGraphData;
                    handleRefreshGraph(
                        graph,
                        currentUnproccessedData,
                        CANVAS_WIDTH,
                        CANVAS_HEIGHT,
                        largeGraphMode,
                        true,
                        false,
                    );
                }
            },
            // offsetX and offsetY include the padding of the parent container
            // 需要加上父级容器的 padding-left 16 与自身偏移量 10
            offsetX: 16 + 10,
            // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
            offsetY: 0,
            // the types of items that allow the menu show up
            // 在哪些类型的元素上响应
            itemTypes: ['node', 'edge', 'canvas'],
        });

        graph = new G6.Graph({
            container: 'container',
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            linkCenter: true,
            minZoom: 0.1,

            modes: {
                default: [{
                        type: 'drag-canvas',
                        enableOptimize: true,
                    },
                    {
                        type: 'zoom-canvas',
                        enableOptimize: true,
                        optimizeZoom: 0.01,
                    }, {
                        type: 'scroll-canvas',
                        direction: 'both',
                        enableOptimize: true,
                        zoomKey: 'ctrl',
                        scalableRange: -0.3
                    },
                    {
                        type: 'lasso-select',
                        selectedState: 'focus',
                        trigger: 'shift',
                    },
                    'drag-node',
                    'shortcuts-call',
                ],

            },

            plugins: [contextMenu, grid, tooltip, legend, ],
        });


        const layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
        layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
        layout.instance = new G6.Layout['gForce'](layoutConfig);
        layout.instance.init({
            nodes: currentUnproccessedData.nodes,
            edges: processedEdges,
        });
        layout.instance.execute();

        bindListener(graph);
        graph.data({ nodes: aggregatedData.nodes, edges: processedEdges });
        graph.render();

    })
    // 遍历所有节点








if (typeof window !== 'undefined')
    window.onresize = () => {
        if (!graph || graph.get('destroyed')) return;
        const container = document.getElementById('container');
        if (!container) return;
        graph.changeSize(container.scrollWidth, container.scrollHeight - 30);
    };