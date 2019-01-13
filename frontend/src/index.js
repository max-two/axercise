import React from 'react'
import ReactDOM from 'react-dom'

import { Progress } from 'react-sweet-progress'
import "react-sweet-progress/lib/style.css"


class App extends React.Component {
    render() {
        return (
            <Progress type="circle" percent={88} status="active" />
        )
    }
}

ReactDOM.render(<App />, document.querySelector('#app'))