const fs = require("fs");
const { productsCard } = require("../config/seed");

const writeAndReadFile = () => {
  fs.writeFile(
    "myArchive.txt",
    JSON.stringify(productsCard, null, 2), // JSON en formato legible
    'utf-8',  // Especifica la codificación correcta aquí
    (err) => {
      if (err) {
        console.error("Error al escribir el archivo:", err);
        return;
      }
      console.log("Se ha escrito correctamente");

      // Leer el archivo y especificar 'utf-8' al leer también
      fs.readFile("myArchive.txt", "utf-8", (err, data) => {
        if (err) {
          console.error("Error al leer el archivo:", err);
          return;
        }
        console.log("Contenido del archivo:", data);
      });
    }
  );
};

module.exports = writeAndReadFile;