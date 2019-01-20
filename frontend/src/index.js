import React from 'react';
import ReactDOM from 'react-dom';

import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';

class App extends React.Component {
    state = {
        selectedDate: new Date(),
    }

    handleDateChange = selectedDate => {
        this.setState({ selectedDate });
    }

    render() {
        return (
            <div>
                <h1> Axercise </h1>
                <span>
                    <Progress type="circle" percent={88} status="active" />
                    <Progress type="circle" percent={33} status="success" />
                </span>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell> Date </TableCell>
                            <TableCell> Description </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <DatePicker value={this.state.selectedDate} onChange={this.handleDateChange} />
                                </MuiPickersUtilsProvider>
                            </TableCell>
                            <TableCell> Biking </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        )
    }
}

ReactDOM.render(<App />, document.querySelector('#app'));