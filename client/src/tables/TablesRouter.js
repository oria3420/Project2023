import { useParams } from "react-router-dom";
import UsersTable from './UsersTable';
import RecipesTable from './RecipesTable';
import TimesCat from './TimesCat';

function TablesRouter() {
  const { type } = useParams();

  if (type === "users") {
    return <UsersTable />;
  } else if (type === "recipes") {
    return <RecipesTable />;
  } else if (type === "times") {
    return <TimesCat />;
  }
  else {
    return <div>Invalid table type</div>;
  }
}

export default TablesRouter