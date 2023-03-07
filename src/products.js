const fs = require("fs");

class ProductManager {
  constructor(route) {
    this.path = route; // lo dejaría para inicializar una clase aparte FileManager (que haria de conector para persistencia de datos).
    // this.fileManager = new FileManager(route); => algo así.
    this.list = []; // quedaria más semántico si volviese a llamarse productList o products.
  }

  // Utils
  createId() {
    const list = this.list; // esta variable no haria falta.
    return list.length === 0 ? 1 : this.list[this.list.length - 1].id + 1;
    // quería => return this.list.length === 0 ? 1 : this.list[this.list.length - 1].id + 1;
  }

  existingProduct(id) {
    const list = this.list;
    const foundProduct = list.find((obj) => obj.id === id);
    return foundProduct ? foundProduct : null;
  } // lo eliminaría y dejaría productById.

  // Functions

  async init() {
    try {
      const list = await fs.promises.readFile(this.path, "utf-8");
      this.list = JSON.parse(list);  // lo dejaría como método de clase en FileManager (que haria de conector para persistencia de datos).
    } catch (error) {
      console.error(`Error al cargar los productos ${error}`);
    }
  }

  async write() { // async write(list) {
    try {
      const list = JSON.stringify(this.list); // list vendría como parámetro al instanciar FileManager.
      await fs.promises.writeFile(this.path, list); // lo dejaría como método de clase en FileManager (que haria de conector para persistencia de datos).
      // await fs.promises.writeFile(this.path,  JSON.stringify(list)); => this.path quedaría igual al ser invocado desde FileManager.
    } catch (error) {
      console.error(`Error al actualizar productos ${error}`);
    }
  }

  async addProduct(product) {
    try {
      const id = this.createId();
      const newProduct = { ...product, id }; // Acá ya podrias utilizar product como modelo.
      this.list.push(newProduct);
      await this.write(); // await this.fileManager.write(this.list);
      return newProduct;
    } catch (error) {
      console.error(`Error al agregar producto ${error}`);
    }
  }

  getProducts() {
    try {
      return this.list; // este método es redundante si list no es privado.
    } catch (error) {
      console.error(`Error al buscar la lista de productos ${error}`);
    }
  }

  getProductById(id) {
    try {
      const product = this.existingProduct(id); // acá dejaría => this.list.find((product) => product.id === id))
      return product ? product : `El producto con id ${id} no existe`;
    } catch (error) {
      console.error(`Error al buscar el producto ${error}`);
    }
  }

  async updateProduct(id, obj) {
    try {
      const existingProduct = this.existingProduct(id);
      if (!existingProduct) {
        return `El producto con el id ${id} no existe.`;
      }
      const updatedProduct = { ...existingProduct, ...obj };
      const index = this.list.indexOf(existingProduct);
      this.list[index] = updatedProduct;
      
       await this.write();
      
      /* se podría simplificar: 
        const existingProduct = this.list.findIndex((product) => product.id === id);
        if (existingProduct === -1) {
          return `El producto con el id ${id} no existe.`;
        }
         this.list[index] = { ... this.list[index], ...obj };
         
          await this.fileManager.write(this.list); */
     
      return updatedProduct;
    } catch (error) {
      console.error(`Error al actualizar producto ${error}`);
    }
  }

  async deleteProduct(id) {
    try {
      const existingProduct = this.existingProduct(id);
      if (!existingProduct) {
        console.log(`El producto con el id ${id} no existe.`);
        return;
      }
      const index = this.list.indexOf(existingProduct);
      this.list.splice(index, 1);
      await this.write();
      
       /* se podría simplificar (como el update): 
        const existingProduct = this.list.findIndex((product) => product.id === id);
        if (existingProduct === -1) {
          return `El producto con el id ${id} no existe.`;
        }
        
       this.list.splice(index, 1);

       await this.fileManager.write(this.list); */
    } catch (error) {
      console.error(`Error al eliminar producto ${error}`);
    }
  }
}

const manager = new ProductManager("./src/products.json");

module.exports = manager;
