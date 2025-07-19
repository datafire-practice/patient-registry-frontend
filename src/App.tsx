import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRouter from "./router/AppRouter";
import { CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
        <CssBaseline />
        <AppRouter />
      </LocalizationProvider>
    </Provider>
  );
};

export default App;
