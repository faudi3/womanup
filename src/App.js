import React from 'react';
import './styles/app.css'

function App() {
    const [list,setList] = React.useState(['pervaya','vtoraya','tretya']);
  return (
    <div className="App">
     <h1>To Do</h1>
        <div className="wrap">
            <div className="left">
                <h2>Задачи</h2>
                {list.map((item, i) =>
                        <p key={i}>{item}</p>
                )}
            </div>
            <div className="left">
                <h2>Создать задачу</h2>
            </div>
        </div>
    </div>
  );
}

export default App;
