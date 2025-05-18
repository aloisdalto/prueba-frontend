import React, { useEffect, useState } from 'react';
import Header from './Header';
import './index.css';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  /*const [childrenStatus, setChildrenStatus] = useState({});*/


  useEffect(() => {
    const fetchNodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api-graph.tests.grupoapok.com/api/nodes${currentParentId ? `?parent=${currentParentId}` : ''}`);
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        const data = await response.json();
        setNodes(data);
      } catch (err) {
        setError(err.message);
        setNodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
  }, [currentParentId]);

  /*useEffect(() => {
    const checkChildren = async () => {
      const status = {};
      for (const node of nodes) {
        try {
          const response = await fetch(`https://api-graph.tests.grupoapok.com/api/nodes?parent=${node.id}`);
          if (!response.ok) {
            throw new Error('Error al verificar los nodos hijos');
          }
          const data = await response.json();
          status[node.id] = data.length > 0; // true si tiene hijos, false si no
        } catch (err) {
          console.error(err);
          status[node.id] = false; // En caso de error, asumimos que no hay hijos
        }
      }
      setChildrenStatus(status);
    };

    if (nodes.length > 0) {
      checkChildren();
    }
  }, [nodes]);*/

  const handleNodeClick = (nodeId) => {
    setCurrentParentId(nodeId); 
  };

  const handleBackToRoot = () => {
    setCurrentParentId(null); 
  };

  const createNode = async (e) => {
    e.preventDefault();
    if (!newNodeTitle) return; 

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

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Error al crear el nodo: ${text}`); 
      }

      const createdNode = JSON.parse(text); 
      setNodes(prevNodes => [...prevNodes, createdNode]); 
      setNewNodeTitle('');
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNode = async (nodeId) => {
    try {
      const response = await fetch(`https://api-graph.tests.grupoapok.com/api/node/${nodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al eliminar el nodo: ${text}`);
      }

      setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    } catch (err) {
      setError(err.message);
    }
  };


  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button className='btn-primary' onClick={handleBackToRoot}>Volver a los Nodos Raíz</button>
      </div>
    );
  }

  return (
    <div className='app'>
      <Header />
      <div className="container">
        <h1 className='title'>Nodos</h1>
        <ul className='list'>
          {nodes.map(node => (
            <li className='node' key={node.id} onClick={() => handleNodeClick(node.id)}>
              {node.title}
                <button className='btn delete' onClick={() => deleteNode(node.id)}>Eliminar</button>
            </li>
          ))}
        </ul>

        {currentParentId && 
          <form onSubmit={createNode} className='form'>
            <input
              type="text"
              value={newNodeTitle}
              onChange={(e) => setNewNodeTitle(e.target.value)}
              placeholder="Título del nuevo nodo"
              className='input'
              required
            />
            <button className='btn-submit' type="submit">Crear Nodo</button>
          </form>
        }

        {currentParentId && 
          <button className='btn-primary' onClick={handleBackToRoot}>Mostrar Nodos Raíz</button>
        }
      </div>
    </div>
  );
};

export default App;
