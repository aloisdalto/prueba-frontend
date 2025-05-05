import React, { useEffect, useState } from 'react';
import Header from './Header';
import NodeList from './Nodelist';
import NodeCreate from './NodeCreate';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null); 

  const initialUrl = "https://api-graph.tests.grupoapok.com/api/node";

  const fetchNodes = (parentId = null) => {
    const url = parentId ? `${initialUrl}?parent=${parentId}` : initialUrl;
    fetch(url)
      .then(response => response.json())
      .then(data => setNodes(data.results))
      .catch(error => console.log(error));
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const handleNodeClick = (nodeId) => {
    setCurrentParentId(nodeId); 
    fetchNodes(nodeId); 
  };

  const handleBackClick = () => {
    const parentNode = nodes.find(node => node.id === currentParentId);
    setCurrentParentId(parentNode?.parent || null);
    fetchNodes(parentNode?.parent || null);
  };

  const handleAddNode = (title) => {
    const newNode = {
      title,
      parent: currentParentId,
    };

    fetch(initialUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNode),
    })
      .then(response => response.json())
      .then(() => fetchNodes(currentParentId))
      .catch(error => console.log(error));
  };

  const handleDeleteNode = (nodeId) => {
    const hasChildren = nodes.some(node => node.parent === nodeId);
    if (hasChildren) {
      alert('No se puede eliminar un nodo que tiene hijos.');
      return;
    }

    fetch(`${initialUrl}/${nodeId}`, {
      method: 'DELETE',
    })
      .then(() => fetchNodes(currentParentId))
      .catch(error => console.log(error));
  };

  return (
    <div>
      <Header />
      <main className="container mt-4 d-flex flex-column">
        {currentParentId && (
          <button onClick={handleBackClick} className="btn btn-secondary mb-3">
            Volver
          </button>
        )}
        <NodeList
          nodes={nodes}
          onNodeClick={handleNodeClick}
        />
        <NodeCreate 
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
        />
      </main>
    </div>
  );
};

export default App;
