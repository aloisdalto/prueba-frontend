import React from 'react';

const NodeList = ({ nodes, onNodeClick }) => {
  return (
    <div>
      <ul className="list-group">
        {nodes.map(node => (
          <li key={node.id} className="list-group-item d-flex justify-content-between align-items-center">
            {node.title}
            <button onClick={() => onNodeClick(node.id)} className="btn btn-primary btn-sm">
              Ver hijos
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NodeList;
