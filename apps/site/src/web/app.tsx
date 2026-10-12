import { Route, Switch } from "wouter";
import Product from "./pages/product";
import { Provider } from "./components/provider";

function App() {
  return (
    <Provider>
      <Switch>
        <Route>
          <Product />
        </Route>
      </Switch>
    </Provider>
  );
}

export default App;
