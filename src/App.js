import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import SudokuBoard from "./Sudoku/SudokuBoard";
import { Container } from 'semantic-ui-react'

class App extends Component {
  render() {
    return (
      <Container>
        <SudokuBoard/>
      </Container>
    );
  }
}

export default App;
