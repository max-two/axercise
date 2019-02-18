import React from 'react';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';

import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';


class WorkoutTable extends React.Component {

    handleSelect = (id, event, checked) => {
        this.props.updateSelected(id, checked);
    }

    handleDateChange = (id, selectedDate) => {
        this.props.updateWorkout(id, { date: selectedDate });
    }

    handleDescriptionChange = (id, event) => {
        this.props.updateWorkout(id, { description: event.target.value });
    }

    handleTeamEventChange = (id, event, checked) => {
        let update = { teamEvent: checked };
        if (!checked) update.organized = checked;

        this.props.updateWorkout(id, update);
    }

    handleOrganizedChange = (id, event, checked) => {
        let update = { organized: checked };
        if (checked) update.teamEvent = checked;

        this.props.updateWorkout(id, update);
    }

    componentDidUpdate(prevProps) {
        if (this.props.workouts.length > prevProps.workouts.length) {
            document.getElementById(`description-${this.props.workouts.length - 1}`).focus();
        }
    }

    generateRows = () => {
        return this.props.workouts.map((workout, index) => {
            const id = workout.id;
            const isSelected = this.props.selected.includes(id);

            return (
                <div className={`table-row ${isSelected && 'table-row-selected'}`} key={`tableRow-${id}`} hover>
                    <div className='table-cell' padding="checkbox">
                        <Checkbox
                            color='primary'
                            checked={isSelected}
                            onChange={this.handleSelect.bind(null, id)}
                        />
                    </div>
                    <div className='table-cell'>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                                value={workout.date}
                                onChange={this.handleDateChange.bind(null, id)}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                    <div className='table-cell description'>
                        <TextField
                            id={`description-${index}`}
                            className='description-field'
                            value={workout.description}
                            onChange={this.handleDescriptionChange.bind(null, id)}
                        />
                    </div>
                    <div className='table-cell' padding="checkbox">
                        <Checkbox
                            checked={workout.teamEvent}
                            onChange={this.handleTeamEventChange.bind(null, id)}
                        />
                    </div>
                    <div className='table-cell' padding="checkbox">
                        <Checkbox
                            checked={workout.organized}
                            onChange={this.handleOrganizedChange.bind(null, id)}
                        />
                    </div>
                    <div className='table-cell'>
                        {this.props.calcPoints(workout)}
                    </div>
                </div>
            );
        })
    }

    render() {
        const numSelected = this.props.selected.length;
        const anySelected = numSelected > 0;

        return (
            <div className='table'>
                <div className={`table-tool-bar ${anySelected && 'selected-active'}`}>
                    <div className={`table-title ${anySelected && 'selected-active-text'}`}>
                        {anySelected ? `${numSelected} selected` : 'Workouts'}
                    </div>
                    <div className='table-action'>
                        {
                            anySelected ? (
                                <Tooltip title='Delete'>
                                    <IconButton>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                    <Tooltip title='Filter list'>
                                        <IconButton>
                                            <FilterListIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                    </div>
                </div>
                <div className='table-head'>
                    <div className='table-header' padding='checkbox'>
                        <Checkbox color='primary' onChange={this.props.handleSelectAll} />
                    </div>
                    <div className='table-header'> Date </div>
                    <div className='table-header'> Description </div>
                    <div className='table-header'> Team Event </div>
                    <div className='table-header'> Organized </div>
                    <div className='table-header'> Points </div>
                </div>
                <div className='table-body'>
                    {this.generateRows()}
                </div>
            </div>
        )
    }
}

export default WorkoutTable;