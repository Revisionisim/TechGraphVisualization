export const grid = new G6.Grid();

// 添加一个搜索框
const searchInput = document.createElement('input');
searchInput.type = 'text';
document.body.appendChild(searchInput);

// 定义搜索函数
function searchNodeByLabel(label) {
    // 查找所有带有指定标签的节点
    const nodes = graph.findAll('node', node => node.getModel().label === label);
    // 高亮显示这些节点
    graph.highlightNodes(nodes.map(node => node.getID()));
}

// 绑定搜索框事件
searchInput.addEventListener('input', (event) => {
    const label = event.target.value;
    // 调用搜索函数
    searchNodeByLabel(label);
});
export const tooltip = new G6.Tooltip({
    offsetX: 20,
    offsetY: 20,
    getContent(e) {
        const outDiv = document.createElement('div')
        outDiv.style.width = 'auto'
        outDiv.innerHTML = `
<ul>
<li><span class="label">名称:</span> <span class="value">${e.item.getModel().label}</span></li>
<li><span class="label">类型:</span> <span class="value">${e.item.getModel().category}</span></li>
</ul>`
        return outDiv
    },
    itemTypes: ['node']
})




