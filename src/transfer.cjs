// const https = require('https');
// const url = require('url');
// const company = [
//     '特斯拉',
//     '华为',
//     'NIO',
//     'BYD',
//     '蔚景汽车',
//     '小鹏汽车',
//     '理想汽车',
//     '长江汽车）',
//     '广汽新能源',

//     '江淮汽车',
//     '吉利汽车',
//     '北汽新能源',
//     '华晨宝马',
//     '一汽-大众',
//     '长安汽车',
//     '东风汽车',
//     '奇瑞汽车'
// ];
// const randomCompany = company[Math.floor(Math.random() * company.length)];
// console.log(randomCompany)
// const requestUrl = 'https://api.ownthink.com/kg/knowledge?entity=' + encodeURIComponent(randomCompany);
// const options = url.parse(requestUrl);

// const req = https.request(options, (res) => {
//     let responseBody = '';
//     res.setEncoding('utf8');
//     res.on('data', (chunk) => {
//         responseBody += chunk;
//     });
//     res.on('end', () => {
//         console.log(responseBody); // 在控制台输出responseBody
//     });
// });

// req.on('error', (error) => {
//     console.error(error);
// });

// req.end();

// /* function convertData(data) {
//     //创建一个空数组，用来存储节点
//     let nodes = [];
//     //创建一个空数组，用来存储边
//     let edges = [];
//     //从数据对象中获取实体和avp属性
//     let entity = data.entity;
//     let avp = data.avp;
//     //将实体作为头节点的id，添加到节点数组中
//     nodes.push({ id: entity });
//     //遍历avp数组，每个元素是一个长度为2的数组
//     for (let pair of avp) {
//         //获取第一个和第二个属性值
//         let label = pair[0];
//         let value = pair[1];
//         //将第二个属性值作为尾节点的id，添加到节点数组中，如果已经存在则跳过
//         if (!nodes.some(node => node.id === value)) {
//             nodes.push({ id: value });
//         }
//         //将头节点的id，尾节点的id，和第一个属性值作为边的label，添加到边数组中
//         edges.push({ source: entity, target: value, label: label });
//     }
//     //返回一个包含节点和边的对象
//     return { nodes: nodes, edges: edges };
// }
//  */