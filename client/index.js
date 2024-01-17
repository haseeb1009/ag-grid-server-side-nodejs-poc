import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { Grid } from 'ag-grid-community';

// function isServerSideGroupOpenByDefault(params) {
//   console.log({ params });
//   var route = params.rowNode.getRoute();
//   if (!route) {
//     return false;
//   }
//   var routeAsString = route.join(",");
//   var routesToOpenByDefault = [
//     "Russia",
//     "Russia,Swimming",
//     "Russia,Diving",
//     "Russia,Gymnastics",
//     "United States,Swimming",
//   ];
//   return routesToOpenByDefault.indexOf(routeAsString) >= 0;
// }

const onScroll = () => {
  const agGridBodyEl = gridDiv.querySelector('.ag-body-viewport');

  if (agGridBodyEl) {
    const { scrollHeight, clientHeight, scrollTop } = agGridBodyEl;
    if (scrollTop + clientHeight + 10 >= scrollHeight) {
      console.log('Reached bottom');
      // DO SOMETHING HERE
    }
  }
};

const gridOptions = {
  columnDefs: [
    { field: "country", rowGroup: true, hide: true, },
    { field: "sport", rowGroup: true, hide: true },
    { field: "athlete" },
    {
      field: "year",
      filter: "number",
    },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
  ],

  rowModelType: "serverSide",
  cacheBlockSize: 50,
  maxBlocksInCache: 3,
  maxConcurrentDatasourceRequests: 1,
  blockLoadDebounceMillis: 1000,
  animateRows: true,
  serverSideStoreType: "partial",
  refreshServerSideStore: true,
  onBodyScroll:onScroll,
  isServerSideGroupOpenByDefault: () => true,
};

const gridDiv = document.querySelector("#myGrid");
new Grid(gridDiv, gridOptions);

const datasource = {
  getRows(params) {
    // console.log("====", params);

    fetch("./olympicWinners/", {
      method: "post",
      body: JSON.stringify(params.request),
      headers: { "Content-Type": "application/json; charset=utf-8" },
    })
      .then((httpResponse) => httpResponse.json())
      .then((response) => {
        params.success({ rowData: response.rows, rowCount: response.lastRow });
      })
      .catch((error) => {
        console.error(error);
        params.fail();
      });
  },
};

gridOptions.api.setServerSideDatasource(datasource);
