export function getCandidates(sudoku, x, y) {
    return [...setIntersection(
        setIntersection(
            rule1(sudoku, getRowIndex(x)),
            rule1(sudoku, getColumnIndex(y))
        ),
        rule1(sudoku, getSquareIndex(x, y))
    )];
}


export function getEmptyRemovedcandidates(){
    return Array.apply(null, Array(9)).map(() => Array.apply(null, Array(9)).map(() => []))
}

export function getEmptySudoku() {
    return Array.apply(null, Array(9)).map(() => Array.apply(null, Array(9)).map(() => 0))
}

export function copySudoku(sudoku) {
    return sudoku.map((row) => row.slice());
}

function setUnion(set1, set2) {
    return new Set([...set1, ...set2]);
};

function setDifference(set1, set2) {
    return new Set([...set1].filter(x => !set2.has(x)));
};

function setIntersection(set1, set2) {
    return new Set([...set1].filter(x => set2.has(x)));
};

// function setIsEqual(set1, set2){
//     return set1.size === set2.size ? set1.size === setUnion(set1, set2).size : false;
// };

function setIsSuperset(set1, set2){
    return set1.size === setUnion(set1, set2).size;
};

function getRowIndex(x){
    return Array.apply(null, Array(9)).map((_, i) => [x, i]);
}

function getColumnIndex(y){
    return Array.apply(null, Array(9)).map((_, i) => [i, y]);
}

function getSquareIndex(x, y){
    const xr = Math.floor(x/3) * 3;
    const yr = Math.floor(y/3) * 3;
    return Array.apply(null, Array(9)).map((_, i) => [xr + Math.floor(i/3), yr + (i%3)]);
}

function getAllGroup(){
    return [].concat(
        [0,1,2,3,4,5,6,7,8].map((r) => getRowIndex(r)),
        [0,1,2,3,4,5,6,7,8].map((c) => getColumnIndex(c)),
        [0,1,2,3,4,5,6,7,8].map((i) => getSquareIndex(Math.floor(i/3)*3, (i%3)*3)),
    );
}

function rule1(sudoku, groupCoordinates){
    return setDifference(new Set([1,2,3,4,5,6,7,8,9]), new Set(groupCoordinates.map((xy) => sudoku[xy[0]][xy[1]])));
}

function rule2(candidateGrid, groupCoordinates, x, y){
    const otherCandidates = groupCoordinates.filter((xy) => xy[0] !== x || xy[1] !== y)
                                      .map((xy) => new Set(candidateGrid[xy[0]][xy[1]]))
                                      .reduce((acc, cur) => setUnion(acc, cur));
    return setDifference(candidateGrid[x][y], otherCandidates)}

function rule3(candidateGrid, groupCoordinates){
    const removeCoordValues = [];
    const unFilledCellCoordinates = groupCoordinates.filter((xy) => candidateGrid[xy[0]][xy[1]].size !== 0)
    for(var _xy of unFilledCellCoordinates){
        const _cellCandidates = candidateGrid[_xy[0]][_xy[1]];
        const subsetCoordinates = [_xy];
        if (_cellCandidates.size){
            for(var xy of unFilledCellCoordinates) {
                const cellCandidates = candidateGrid[xy[0]][xy[1]];
                if(_xy !== xy && cellCandidates.size){
                    if (setIsSuperset(_cellCandidates, cellCandidates)){
                        subsetCoordinates.push(xy);
                    }
                }
            }
            if (subsetCoordinates.length === _cellCandidates.size){
                for (let __xy of unFilledCellCoordinates.filter(coord => !subsetCoordinates.includes(coord))){
                    removeCoordValues.push([__xy, new Set([..._cellCandidates])])
                }
            }
        }
    }
    return removeCoordValues;
}

function rule4(candidateGrid, squareCoordinates, groupCoordinates){
    const removeCoordValues = [];
    const squareCandidates = squareCoordinates.map(xy => candidateGrid[xy[0]][xy[1]]);
    const groupCandidates = groupCoordinates.map(xy => candidateGrid[xy[0]][xy[1]]);
    const intersectingCandidates = setIntersection(new Set(squareCandidates), new Set(groupCandidates));
    const removeCandidates = [...[...intersectingCandidates].reduce((acc, cur) => setUnion(acc, cur))];
    for (let _ of [[squareCandidates, groupCoordinates, squareCoordinates],
                   [groupCandidates, squareCoordinates, groupCoordinates]]) {
        const searchCandidates = _[0];
        const removeCoordinates = _[1];
        const searchCoordinates = _[2];
        const complementCandidates = [...setDifference(searchCandidates, intersectingCandidates)];
        for (let value of removeCandidates){
            const remove = complementCandidates.map(candidates => !candidates.has(value)).reduce((acc, cur) => acc && cur);
            if (remove){
                const removeCoords = removeCoordinates.filter(removeCoordinate => searchCoordinates.map(xy => removeCoordinate.toString() !== xy.toString())
                                                                                                   .reduce((acc, cur)=> acc && cur));
                for (let xy of removeCoords){
                    removeCoordValues.push([xy, new Set([value])]);
                }
            }
        }
    }
    return removeCoordValues;
}

function getCandidateGrid(sudoku){
    return sudoku.map(
        (row, rIndex) => row.map(
            (cell, cIndex) => {
                return cell === 0 ? new Set(getCandidates(sudoku, rIndex, cIndex)) : new Set([]);
            }
        )
    )
}

function applyRule2(candidateGrid){
    const newCandidateGrid = candidateGrid.map(
        (row, rIndex) => row.map(
            (cellCandidates, cIndex) => {
                const newCellCandidates = setUnion(
                    setUnion(
                        rule2(candidateGrid, getRowIndex(rIndex), rIndex, cIndex),
                        rule2(candidateGrid, getColumnIndex(cIndex), rIndex, cIndex)
                    ),
                    rule2(candidateGrid, getSquareIndex(rIndex, cIndex), rIndex, cIndex)
                );
                return newCellCandidates.size === 1 ? new Set(newCellCandidates) : new Set(cellCandidates);
            }
        )
    );
    return newCandidateGrid;
}

function applyRule3(candidateGrid){
    const newCandidateGrid = candidateGrid.map(row => row.map(candidates => new Set(candidates)));
    const removeSubsets = [].concat(...getAllGroup().map(groupIndex => rule3(candidateGrid, groupIndex)));
    for(var removeSubset of removeSubsets){
        const xy = removeSubset[0];
        const removeSet = removeSubset[1];
        newCandidateGrid[xy[0]][xy[1]] = setDifference(newCandidateGrid[xy[0]][xy[1]], removeSet);
    }
    return newCandidateGrid;
}

function applyRule4(candidateGrid){
    const newCandidateGrid = candidateGrid.map(row => row.map(candidates => new Set(candidates)));
    const squareGroupAnchors = [0,1,2,3,4,5,6,7,8].map(i => [Math.floor(i/3)*3, (i%3)*3])
    for (let xy of squareGroupAnchors){
        const squareGroup = getSquareIndex(xy[0], xy[1]);
        const groupFunctions = [getRowIndex, getColumnIndex]
        for(var i = 0; i < xy.length; i++){
            for(var j = 0; j < 3; j++){
                const group = groupFunctions[i](xy[i]+ j);
                const removeCoordValues = rule4(candidateGrid, squareGroup, group);
                for (let removeCoordValue of removeCoordValues){
                    const r = removeCoordValue[0][0];
                    const c = removeCoordValue[0][1];
                    const value = removeCoordValue[1];
                    newCandidateGrid[r][c] = setDifference(newCandidateGrid[r][c], value)
                }
            }
        }
    }
    return newCandidateGrid;
}

function countCandidates(candidateGrid){
    return candidateGrid.map(candidates => candidates.map(candidate => candidate.size)
                                                     .reduce((acc, cur) => acc + cur))
                        .reduce((acc, cur) => acc + cur)
}

export function isSolved(sudoku){
    return getAllGroup().map(groupIndex => {
        const group = groupIndex.map(xy => sudoku[xy[0]][xy[1]]);
        const solved = new Set(group).size === 9 && setUnion(new Set([1,2,3,4,5,6,7,8,9]), new Set(group)).size === 9;
        return solved;
    }).reduce((acc, cur)=> acc && cur);
}

export function solveOnce(sudoku) {
    let candidateGrid = getCandidateGrid(sudoku)
    let candidateCount = 0;
    while (candidateCount !== countCandidates(candidateGrid)) {
        candidateCount = countCandidates(candidateGrid);
        candidateGrid = applyRule2(candidateGrid);
        candidateGrid = applyRule3(candidateGrid);
        candidateGrid = applyRule4(candidateGrid);
    }


    const newSudoku = sudoku.map((row) => row.slice());
    for (let r = 0; r < 9; r++){
        for (let c = 0; c < 9; c++) {
            const candidate = candidateGrid[r][c];
            if (candidate.size === 1) {
                newSudoku[r][c] = [...candidate][0];
                candidateGrid[r][c] = new Set([]);
            }
        }
    }
    return {'sudoku': newSudoku, 'candidateGrid': candidateGrid};
}