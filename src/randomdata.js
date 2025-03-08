/* const { uniqueId } = G6.Util; */
const enterprise_products = {
    "特斯拉（Tesla）": ["Model S Plaid", "Model X Long Range", "Model 3 Standard Range Plus", "Model Y Performance", "Cybertruck Dual Motor", "Roadster"],
    "华为（Huawei）": ["HI平台", "5G-V2X通信模块", "无线电波雷达", "MDC 600高清数字化摄像头"],
    "NIO（蔚来汽车）": ["ES6 Sport", "ES8 Premier", "EC6 Performance", "ET7 Performance"],
    "BYD（比亚迪）": ["秦Pro EV超长续航", "唐DM-i四驱豪华", "汉EV全能旗舰", "元EV535", "宋Pro EV", "T3微型货车"],
    "蔚景汽车（WM Motor）": ["EX5 Plus", "EX6 Plus", "W6", "E5"],
    "小鹏汽车（XPeng）": ["P7 Wing", "G3i 460", "P5", "P4"],
    "理想汽车（Li Auto）": ["Li ONE", "Li ONE Pro", "Li ONE Elite", "Li ONE Sapphire", "Li Xiang One"],
    "长江汽车（CHJ Automotive）": ["小蚂蚁EV", "星途锐程", "星途L7", "星途TX"],
    "广汽新能源": ["Aion Y", "Aion S", "Aion LX", "Aion V"],
    "宁德时代（CATL）": ["EV动力电池", "ESS储能电池", "EV模块化电源系统"],
    "比亚迪（BYD）": ["Han EV", "Tang DM-i", "Qin Plus", "Song Pro DM"],
    "江淮汽车": ["iEV7S", "iEVA50", "iEVS4", "iEVS4R"],
    "吉利汽车": ["远景X3 EV", "星越PHEV", "帝豪EV", "缤瑞EV"],
    "北汽新能源": ["EU5", "EU7", "EX3", "EX5 Plus"],
    "华晨宝马": ["iX3", "i4", "iNEXT", "i7"],
    "一汽-大众": ["威霆EV", "凌渡PHEV", "探岳PHEV", "蔚揽PHEV"],
    "长安汽车": ["欧尚A800 EV", "奔奔EV", "逸动EV", "睿骋CC EV"],
    "东风汽车": ["风行T5 EV", "风神AX7 EV", "风光580 EV", "风光S560 EV"],
    "奇瑞汽车": ["瑞虎7 EV", "瑞虎5"]

};
const industry_technology = {
    "正极材料": {
        Tech: ["锂矿", "镍矿", "钴矿", "锰矿"],
        belongsto: "原材料"
    },
    "负极材料": {
        Tech: ["石墨"],
        belongsto: "原材料"
    },
    "电解液": {
        Tech: ["六氟磷酸锂"],
        belongsto: "原材料"
    },
    "隔膜": {
        Tech: ["聚乙烯", "聚丙烯"],
        belongsto: "原材料"
    },
    "电池": {
        Tech: ["PACK", "电芯"],
        belongsto: "组件"
    },
    "电机": {
        Tech: ["永磁材料", "硅钢片"],
        belongsto: "组件"
    },
    "电控": {
        Tech: ["IGBT芯片", "PCB板"],
        belongsto: "组件"
    },
    "车身附件": {
        Tech: ["车窗玻璃", "方向盘", "座椅", "后视镜", "仪表盘", '车灯'],
        belongsto: "组件"
    },
    "底盘": {
        Tech: ["减震器", "车轮", "刹车片", "后视镜", "仪表盘", "转动轴", "车桥"],
        belongsto: "组件"
    },
    "汽车电子": {
        Tech: ["电子控制系统", "车载电子装置"],
        belongsto: "组件"
    },
    "乘用车": {
        Tech: ["轿车", "SUV"],
        belongsto: "整车"
    },
    "商用车": {
        Tech: ["客车", "货车"],
        belongsto: "整车"
    },
    "充电服务": {
        Tech: ['充电服务', '充电设施', '换电设备', '电池回收'],
        belongsto: "市场服务"
    },
    "后市场服务": {
        Tech: ["汽车金融", "汽车保险", "汽车租赁", "二手车交易", "汽车拆解回收"],
        belongsto: "市场服务"
    }
};
const enterprises = Object.keys(enterprise_products);
const products = Object.values(enterprise_products).flat();

const technology = Object.keys(industry_technology);

const Technology = Object.values(industry_technology);

const nodes = [];
const edges = [];

/* 
for (const industry in industry_technology) {
    const TechArr = industry_technology[industry].Tech;
    const stream = industry_technology[industry].belongsto;

    nodes.push({
        id: industry,
        category: "产业",
        belongsto: stream,

    });

    TechArr.forEach((Tech) => {
        nodes.push({
            id: Tech,
            category: "产业",
            belongsto: stream,

        });
    });
    for (let Tech of TechArr) {
        edges.push({
            source: industry,
            target: Tech,
            label: "子产业"
        });
    }

} 
const data = { nodes, edges };
console.log(JSON.stringify(data));*/
// Add nodes for each enterprise and product
const enterprise_nodes = [];
const product_nodes = [];

for (const enterprise in enterprise_products) {
    // Add enterprise node
    enterprise_nodes.push({ id: enterprise, category: "企业", belongsto: "整车", });

    // Add product nodes and edges to the enterprise node
    const products = enterprise_products[enterprise];
    for (const product of products) {
        product_nodes.push({ id: product, category: "产品", belongsto: "整车", });
        edges.push({ source: enterprise, target: product, label: "主要产品" });
    }
}

// Combine enterprise and product nodes
const cnodes = [...enterprise_nodes, ...product_nodes];
/* console.log(JSON.stringify(cnodes)) */


function generateRandomTechWord() {

    const industries = ['原材料', '组件', '整车', '市场服务'];

    const techWords = [
        '燃料电池', '电驱动', '智能驾驶', '车联网', '轻量化材料', '充电设施', '无人驾驶', '氢燃料', '混合燃料', '纯电动', '车载语音', '光伏充电', '快速充电', '新能源发动机', '车内空气净化', '电机调控', "驱动装置", "动力总成", "测试方法", "管理系统", "制动控制", "控制", "混合动力", "动力电池", "机动车辆"
    ];
    const suffixs = ['系统', '装置', '方法', '工艺', '汽车', '发动机', '电机', '电控', '电池', '', '']

    const randomIndustry = industries[Math.floor(Math.random() * industries.length)];
    const randomSuffix = suffixs[Math.floor(Math.random() * suffixs.length)]
    const randomTechWord = techWords[Math.floor(Math.random() * techWords.length)] + randomSuffix;

    return {
        label: `${randomTechWord}`,
        belongsto: `${randomIndustry}`,

    };
}


function generateCompanyName() {
    const firstWords = ['东方', '中华', '新华', '大地', '天使', '嘉美', '金利', '信诚', '安盛', '兴发'];
    const secondWords = ['科技', '信息', '网络', '通信', '软件', '实业', '创新', '科学', '控股', '投资'];
    const lastWords = ['有限公司', '股份有限公司', '集团有限公司', '科技发展有限公司', '网络科技有限公司', '信息科技有限公司', '通讯科技有限公司', '软件有限公司', '实业有限公司', '创新有限公司'];

    const randomFirst = firstWords[Math.floor(Math.random() * firstWords.length)];
    const randomSecond = secondWords[Math.floor(Math.random() * secondWords.length)];
    const randomLast = lastWords[Math.floor(Math.random() * lastWords.length)];

    return randomFirst + randomSecond + randomLast;
}

function generateRandomPatentName() {
    const prefixOptions = ['基于', '依托于', '新型的'];
    const actionOptions = ['实现', '使用', '支持', '优化', '改进'];
    const targetOptions = ['静态数据同步', '3D同步信号发射器', '智能化水龙头系统', '智能安全锁', '无人机航拍系统'];
    const nounOptions = ['方法', '系统', '装置', '设备', '机制'];


    const prefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)];
    const action = actionOptions[Math.floor(Math.random() * actionOptions.length)];
    const target = targetOptions[Math.floor(Math.random() * targetOptions.length)];
    const noun = nounOptions[Math.floor(Math.random() * nounOptions.length)];


    const patentName = `一种${prefix}${action}${target}的${noun}`;
    return patentName;
}

function generateRandomProductName() {

    const model = products[Math.floor(Math.random() * products.length)];
    return model;
}

function generateRandomLabel(dataType) {
    if (dataType == '专利') return generateRandomPatentName();
    if (dataType == '企业') return generateCompanyName();
    if (dataType == '技术') return generateRandomTechWord().label;
    if (dataType == '产品') return generateRandomProductName();

}
let idCounter = 0; // 添加这一行
/* function generateData(numNodes, sourceNode, dataType) {
    const nodes = [];
    const edges = [];

      if (dataType != '技术') nodes.push({ id: sourceNode, label: generateRandomTechWord(), category: '技术' });

    for (let i = 1; i <= numNodes; i++) {
        let id;
        switch (dataType) {
            case '技术':
                id = `t${idCounter++}`;
                break;
            case '专利':
                id = `p${idCounter++}`;
                break;
            case '企业':
                id = `e${idCounter++}`;
                break;

        }
        const label = generateRandomLabel(dataType);
        const category = dataType;
        const source = sourceNode;
        const target = id;
       
        nodes.push({ id, label, category  });
      
        edges.push({ source, target });
    }

    return {
        nodes: nodes,
        edges: edges
    };
} */

function generateData(numNodes, numEdges) {
    let generatedData = null;
    if (generatedData) {
        return generatedData;
    }
    const nodes = [];
    const edges = [];
    for (let i = 0; i < numNodes; i++) {
        nodes.push({
            id: generateRandomTechWord().label,
            /*   label: generateRandomTechWord().label, */
            category: '技术',
            belongsto: generateRandomTechWord().belongsto
        });
    }

    const nodesByIndustry = {};
    nodes.forEach((node) => {
        if (!nodesByIndustry[node.belongsto]) {
            nodesByIndustry[node.belongsto] = [];
        }
        nodesByIndustry[node.belongsto].push(node.id);
    });

    const nodeIds = nodes.map((node) => node.id);

    for (let i = 0; i < numEdges; i++) {
        let source, target;
        do {
            source = nodeIds[Math.floor(Math.random() * numNodes)];
            target = nodeIds[Math.floor(Math.random() * numNodes)];
        } while (source === target || edges.some((edge) => (edge.source === source && edge.target === target) || (edge.source === target && edge.target === source)));

        edges.push({
            source,
            target,
        });
    }

    // 保存生成的节点数组和边数组
    generatedData = { nodes, edges };

    // 返回生成的节点数组和边数组
    return generatedData;
}


const rdata = generateData(100, 200);