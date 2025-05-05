import React, { useState } from 'react';

const NodeForm = ({ onAddNode }) => {
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddNode({ title });
        setTitle('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del nodo"
                className="form-control"
                required
            />
            <button type="submit" className="btn btn-primary mt-2">Agregar Nodo</button>
        </form>
    );
};

export default NodeForm;
