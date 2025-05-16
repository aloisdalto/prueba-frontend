import React, { useEffect, useState } from 'react';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      setError(null); // Reiniciar el error antes de la nueva solicitud
      try {
        const response = await fetch(`https://api-graph.tests.grupoapok.com/api/nodes${currentParentId ? `?parent=${currentParentId}` : ''}`);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const data = await response.json();
        setNodes(data); // Asumiendo que la respuesta es un array de nodos
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [currentParentId]);

  const handleNodeClick = (nodeId) => {
    setCurrentParentId(nodeId); // Cambia el parentId para obtener los hijos
  };

  const handleBackToRoot = () => {
    setCurrentParentId(null); // Volver a los nodos raíz
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Nodos</h1>
      <ul>
        {nodes.map(node => (
          <li key={node.id} onClick={() => handleNodeClick(node.id)}>
            {node.title}
          </li>
        ))}
      </ul>
      {currentParentId && <button onClick={handleBackToRoot}>Mostrar Nodos Raíz</button>}
    </div>
  );
};


export default App;
