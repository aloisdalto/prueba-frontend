import React, { useEffect, useState } from 'react';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');

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

  //Función para crear un nuevo nodo
  const createNode = async (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario
    if (!newNodeTitle) return; // Asegúrate de que el título no esté vacío

    try {
      const response = await fetch('https://api-graph.tests.grupoapok.com/api/node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parent: currentParentId,
          title: newNodeTitle,
          created_at: null,
          updated_at: null 
        }),
      });

      const text = await response.text(); // Obtén la respuesta como texto
      if (!response.ok) {
        throw new Error(`Error al crear el nodo: ${text}`); // Muestra el texto de error
      }

      const createdNode = JSON.parse(text); // Intenta analizar el texto como JSON
      setNodes(prevNodes => [...prevNodes, createdNode]); // Agrega el nuevo nodo a la lista
      setNewNodeTitle(''); // Limpia el campo de entrada
    } catch (err) {
      setError(err.message);
    }
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

      <form onSubmit={createNode}>
        <input
          type="text"
          value={newNodeTitle}
          onChange={(e) => setNewNodeTitle(e.target.value)}
          placeholder="Título del nuevo nodo"
          required
        />
        <button type="submit">Crear Nodo</button>
      </form>
    </div>
  );
};


export default App;
