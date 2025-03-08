function convertData(data) {
    //创建一个空数组，用来存储节点
    let nodes = [];
    //创建一个空数组，用来存储边
    let edges = [];
    //从数据对象中获取实体和avp属性
    let entity = data.entity;
    let avp = data.avp;
    //将实体作为头节点的id，添加到节点数组中
    nodes.push({ id: entity });
    //遍历avp数组，每个元素是一个长度为2的数组
    for (let pair of avp) {
        //获取第一个和第二个属性值
        let label = pair[0];
        let value = pair[1];
        //将第二个属性值作为尾节点的id，添加到节点数组中，如果已经存在则跳过
        if (!nodes.some(node => node.id === value)) {
            nodes.push({ id: value });
        }
        //将头节点的id，尾节点的id，和第一个属性值作为边的label，添加到边数组中
        edges.push({ source: entity, target: value, label: label });
    }
    //返回一个包含节点和边的对象
    return { nodes: nodes, edges: edges };
}
