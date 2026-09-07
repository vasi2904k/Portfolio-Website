// Fixed seed keeps the graph stable through re-renders and quality changes.
export function createNetwork() {
  const nodes = [], edges = [], columns = [];
  let seed = 29;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const counts = [7, 12, 15, 12, 6];
  counts.forEach((count, column) => {
    const indices = [], x = (column - 2) * 1.7;
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963, radius = Math.sqrt((i + .5) / count) * (column === 0 || column === 4 ? 1.7 : 2.9);
      indices.push(nodes.length);
      nodes.push({ position: [x + (random() - .5) * .4, Math.cos(angle) * radius, Math.sin(angle) * radius * .8], layer: column === 0 ? 1 : column === 4 ? 3 : 2, color: column === 4 ? "#c6b6ff" : column === 0 ? "#b0f8cd" : "#58cdb7", size: .045 + random() * .055 });
    }
    columns.push(indices);
  });
  columns.slice(0, -1).forEach((column, c) => column.forEach((from, i) => columns[c + 1].forEach((to, j) => { if ((i + j) % 3 === 0 || j === i % columns[c + 1].length) edges.push([from, to]); })));
  return { nodes, edges };
}
