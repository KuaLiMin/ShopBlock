// frontend/src/components/JsonDisplay.js
import React, { useEffect, useState } from 'react';

const JsonDisplay = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/fetch-json/')
            .then(response => response.json())
            .then(data => setData(data));
    }, []);

    return (
        <div>
            <h1>JSON Data</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default JsonDisplay;