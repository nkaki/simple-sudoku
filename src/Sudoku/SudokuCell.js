import React, { Component } from 'react';
import './SudokuCell.css';

class SudokuBoard extends Component {
    render() {
        var cell = [];
        var candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (this.props.value !== 0) {
            cell.push(<button key='value' className='value' onClick={() => this.props.onClick(0)}>{this.props.value}</button>);
        } else {
            for (var i = 0; i < candidates.length; i++) {
                const candidate = candidates[i];
                if (this.props.candidates.indexOf(candidate) !== -1){
                    if (this.props.removedCandidates.includes(candidate)){
                            cell.push(
                                <button key={'candidate-'+ candidate} className='candidate removed'
                                    onContextMenu={(e) => {this.props.onContextMenu(candidate); e.preventDefault();}}
                                    onClick={() => this.props.onClick(candidate)}>
                                    {candidate}
                                </button>);
                    } else {
                        cell.push(
                            <button key={'candidate-'+ candidate} className='candidate'
                                onContextMenu={(e) => {this.props.onContextMenu(candidate); e.preventDefault();}}
                                onClick={() => this.props.onClick(candidate)}>
                                {candidate}
                            </button>);
                    }
                } else {
                    cell.push(<button key={'candidate-'+ candidate} className='placeholder'></button>);
                }
            }
        }
        return (
            <div className='wrapper'>
                {cell}
            </div>
        );
  }
}

export default SudokuBoard;
