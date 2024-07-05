// App.tsx
import React from 'react';
import * as Components from './assets';

const App: React.FC = () => {
    return (
        <div className="App">
            <Components.ShoppingList />
        </div>
    );
};

export default App;
