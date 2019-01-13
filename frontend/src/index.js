import React from 'react'
import ReactDOM from 'react-dom'


class App extends React.Component {
    render() {
        return (
            <div> hello fellow humans </div>
        )
    }
}

ReactDOM.render(<App />, document.querySelector('#app'))