import React, { useEffect, useState } from 'react';
import Header from './Header';
import './index.css';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [locales, setLocales] = useState([]);

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const response = await fetch('https://api-graph.tests.grupoapok.com/api/locales');
        const data = await response.json();
        setLocales(data);
      } catch (err) {
        console.error('Error al obtener los idiomas:', err);
      }
    };

    fetchLocales();
  }, []);

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

  const checkIfNodeHasChildren = async (nodeId) => {
    const response = await fetch(`https://api-graph.tests.grupoapok.com/api/nodes?parent=${nodeId}`);
    const children = await response.json();
    return children.length > 0; 
  };

  const deleteNode = async (nodeId) => {
    const hasChildren = await checkIfNodeHasChildren(nodeId);
    if (hasChildren) {
      alert('No puedes eliminar este nodo porque tiene hijos.');
      return;
    }

    try {
      const response = await fetch(`https://api-graph.tests.grupoapok.com/api/node/${nodeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al eliminar el nodo: ${text}`);
      }

      setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
      alert('El nodo se ha eliminado con éxito.');
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchNodeTitleInLocale = async (nodeId, locale) => {
    const response = await fetch(`https://api-graph.tests.grupoapok.com/api/node/${nodeId}?locale=${locale}`);
    const data = await response.json();
    
    if (data.translation && data.translation.length > 0) {
      const translation = data.translation.find(t => t.locale === locale);
      
      if (translation) {
        return translation.title;
      }
    }
    
    return data.title;
  };
  

  const handleLocaleChange = async (nodeId, locale) => {
    const titleInLocale = await fetchNodeTitleInLocale(nodeId, locale);
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, title: titleInLocale } : node
      )
    );
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
            <li className='node' >
              <span key={node.id} onClick={() => handleNodeClick(node.id)}>{node.title}</span>
              <div className="actions">
                <select className='select' onChange={(e) => handleLocaleChange(node.id, e.target.value)} defaultValue="en_US">
                  {locales.map(locale => (
                    <option key={locale.locale} value={locale.locale}>{locale.label}</option>
                  ))}
                </select>
                <button className='btn delete' onClick={() => deleteNode(node.id)}>Eliminar</button>
              </div>
              
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