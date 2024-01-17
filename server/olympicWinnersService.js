import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password123'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});
class OlympicWinnersService {

    getData(request, resultsCallback) {

        const SQL = this.buildSql(request);

        connection.query(SQL, (error, results) => {
            const rowCount = this.getRowCount(request, results);
            const resultsForPage = this.cutResultsToPageSize(request, results);

            resultsCallback(resultsForPage, rowCount);
        });
    }

    buildSql(request) {

        const selectSql = this.createSelectSql(request);
        const fromSql = ' FROM sample_data.olympic_winners ';
        // const whereSql = this.createWhereSql(request);
        const limitSql = this.createLimitSql(request);

        // const groupBySql = this.createGroupBySql(request);

        const SQL = selectSql + fromSql + limitSql;

        console.log('SQL ==> ', SQL);
        
        return SQL;
    }

    createSelectSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        // if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
        //     const colsToSelect = [];

        //     const rowGroupCol = rowGroupCols[groupKeys.length];
        //     colsToSelect.push(rowGroupCol.field);

        //     valueCols.forEach(function (valueCol) {
        //         colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
        //     });

        //     return ' select ' + colsToSelect.join(', ');
        // }

        return ' select country, sport, athlete, age';
    }


    createWhereSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        const whereParts = [];

        if (groupKeys.length > 0) {
            groupKeys.forEach(function (key, index) {
                const colName = rowGroupCols[index].field;
                whereParts.push(colName + ' = "' + key + '"')
            });
        }

        if (whereParts.length > 0) {
            return ' where ' + whereParts.join(' and ');
        } else {
            return '';
        }
    }

    createGroupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        return '';
        // if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
        //     const colsToGroupBy = [];

        //     const rowGroupCol = rowGroupCols[groupKeys.length];
        //     colsToGroupBy.push(rowGroupCol.field);

        //     return ' group by ' + colsToGroupBy.join(', ');
        // } else {
        //     // select all columns
        //     return '';
        // }
    }

    isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level. we are at the lowest level
        // if we are grouping by more columns than we have keys for (that means the user
        // has not expanded a lowest level group, OR we are not grouping at all).
        return rowGroupCols.length > groupKeys.length;
    }

    createLimitSql(request) {
        const startRow = request.startRow;
        const endRow = request.endRow;
        const pageSize = endRow - startRow;
        return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
    }

    getRowCount(request, results) {
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }
        const currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    cutResultsToPageSize(request, results) {
        const pageSize = request.endRow - request.startRow;
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        } else {
            return results;
        }
    }
}

export default new OlympicWinnersService();