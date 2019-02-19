import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { toast } from 'react-toastify';


import { MuiPickersUtilsProvider, DatePicker } from 'material-ui-pickers';
import DateFnsUtils from '@date-io/date-fns';


class WorkoutTable extends React.Component {
    filterOptions = [
        'This Month',
        'This Year',
        'All Time'
    ];

    filters = {
        0: workout => {
            const date = new Date();
            return workout.date.getMonth() === date.getMonth();
        },
        1: workout => {
            const date = new Date();
            return workout.date.getYear() === date.getYear();
        },
        2: () => true
    }

    state = {
        anchorEl: null,
        filter: 0,
    };

    handleSelect = (id, event, checked) => {
        this.props.updateSelected(id, checked);
    }

    handleDateChange = (id, selectedDate) => {
        const date = new Date();
        if (selectedDate.getMonth() === date.getMonth() && selectedDate.getYear() === date.getYear()) {
            this.props.updateWorkout(id, { date: selectedDate });
        } else {
            toast.error('Can only edit workouts from this month');
        }
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

    handleFilterOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleFilterClose = () => {
        this.setState({ anchorEl: null });
    };

    handleSelectFilter = (event, index) => {
        this.setState({ filter: index, anchorEl: null });
    };

    generateRows = filteredWorkouts => {
        return filteredWorkouts.map((workout, index) => {
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
                            autoFocus={workout.status === 'unsaved'}
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
        const { anchorEl } = this.state;
        const numSelected = this.props.selected.length;
        const anySelected = numSelected > 0;
        const filteredWorkouts = this.props.workouts.filter(workout => this.filters[this.state.filter](workout));

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
                                    <IconButton onClick={this.props.deleteWorkout}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                    <Tooltip title='Filter list'>
                                        <IconButton onClick={this.handleFilterOpen}>
                                            <FilterListIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                    </div>
                </div>
                <div className='table-head'>
                    <div className='table-header' padding='checkbox'>
                        <Checkbox
                            color='primary'
                            checked={anySelected && numSelected === filteredWorkouts.length}
                            onChange={(event, checked) => this.props.handleSelectAll(filteredWorkouts, checked)}
                        />
                    </div>
                    <div className='table-header'> Date </div>
                    <div className='table-header'> Description </div>
                    <div className='table-header'> Team Event </div>
                    <div className='table-header'> Organized </div>
                    <div className='table-header'> Points </div>
                </div>
                <div className='table-body'>
                    {
                        this.props.workouts.length
                            ? this.generateRows(filteredWorkouts)
                            : <div className='empty-table-text'> No workouts added yet, add your first using the button below </div>
                    }
                </div>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleFilterClose}
                >
                    {this.filterOptions.map((option, index) => (
                        <MenuItem
                            key={`filter-option-${index}`}
                            selected={index === this.state.filter}
                            onClick={event => this.handleSelectFilter(event, index)}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        )
    }
}

export default WorkoutTable;