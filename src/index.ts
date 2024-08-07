import colors from "colors";
import server from "./server";

const port = process.env.PORT || 4000;

// corre el servidor en el puerto o host seleccionado
server.listen(port, () => {
  console.log(
    colors.magenta.bold(`REST API funcionando en http://localhost:${port}/`)
  );
});
