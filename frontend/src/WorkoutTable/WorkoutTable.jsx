import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';

import TextField from '@material-ui/core/TextField';

import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';


class WorkoutTable extends React.Component {

    handleDateChange = (index, selectedDate) => {
        this.props.updateWorkout(index, 'date', null, selectedDate);
    }

    componentDidUpdate(prevProps) {
        if (this.props.workouts.length > prevProps.workouts.length) {
            document.getElementById(`description-${this.props.workouts.length - 1}`).focus();
        }
    }

    generateRows = () => {
        return this.props.workouts.map((workout, index) => {
            return (
                <TableRow key={`tableRow-${index}`} hover>
                    <TableCell padding="checkbox">
                        <Checkbox />
                    </TableCell>
                    <TableCell>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker value={workout.date} onChange={this.handleDateChange.bind(null, index)} />
                        </MuiPickersUtilsProvider>
                    </TableCell>
                    <TableCell>
                        <TextField
                            id={`description-${index}`}
                            margin="normal"
                        />
                    </TableCell>
                    <TableCell padding="checkbox">
                        <Checkbox onChange={this.props.updateWorkout.bind(null, index, 'teamEvent')} />
                    </TableCell>
                    <TableCell padding="checkbox">
                        <Checkbox onChange={this.props.updateWorkout.bind(null, index, 'organized')} />
                    </TableCell>
                    <TableCell>
                        {this.props.calcPoints(workout)}
                    </TableCell>
                </TableRow>
            );
        })
    }

    render() {
        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox />
                        </TableCell>
                        <TableCell> Date </TableCell>
                        <TableCell> Description </TableCell>
                        <TableCell> Team Event </TableCell>
                        <TableCell> Organized </TableCell>
                        <TableCell> Points </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.generateRows()}
                </TableBody>
            </Table>
        )
    }
}

export default WorkoutTable;