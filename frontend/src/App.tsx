import * as Components from './assets';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Product List</h1>
      </header>
      <main>
        <Components.ProductTable />
      </main>
    </div>
  );
};

export default App;
