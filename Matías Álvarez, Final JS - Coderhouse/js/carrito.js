let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//variable productosJSON para poder trabajar con la funcion obtenerJSON
let productosJSON = [];
// variable de monto que mantiene los datos al refrescar la ventana
let cantidadTotalCompra = carrito.length;
//Agrego todo el codigo generado por dom
$(document).ready(function () {
  $("#cantidad-compra").text(cantidadTotalCompra);
  //Ordenar productos
  $("#seleccion option[value='pordefecto']").attr("selected", true);
  $("#seleccion").on("change", ordenarProductos);




  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  obtenerJSON();
  productCards();
  mostrarEnTabla();
  $("#btn-continuar").on('click', function (e) {
    if (carrito.length == 0) {
      e.preventDefault();
      Swal.fire({
        icon: 'error',
        title: 'No hay ningun item en tu carrito',
        text: 'Agrega algun producto para continuar',
        confirmButtonColor: "#444444"
      })
    }
  });
})

function productCards() {
  for (const producto of productosJSON) {
    $("#section-productos").append(`<div class="card-product"> 
                            <div class="img-container">
                            <img src="${producto.foto}" alt="${producto.nombre}" class="img-product"/>
                            </div>
                            <div class="info-producto">
                            <p class="font">${producto.nombre}</p>
                            <p class="font">${producto.descripcion}</p>
                            <strong class="font">$${producto.precio}</strong>
                            <button class="botones" id="btn${producto.id}"> Agregar al carrito </button>
                            </div>
                            </div>`);
    $(`#btn${producto.id}`).on('click', function () {
      agregarAlCarrito(producto);
    });
  }
};

//funcion utilizando AJAX para obtener la informacion de los productos creados en el archivo json

function obtenerJSON() {
  $.getJSON("../json/productos.json", function (respuesta, estado) {
    if (estado == "success") {
      productosJSON = respuesta;
      productCards();
    }
  });
}

// Funcion que ordena productos:
function ordenarProductos() {
  let seleccion = $("#seleccion").val();
  if (seleccion == "defecto") {
    productosJSON.sort(function (a, b) {
      return a.id - b.id
    });
  } else if (seleccion == "menor") {
    productosJSON.sort(function (a, b) {
      return a.precio - b.precio
    });
  } else if (seleccion == "mayor") {
    productosJSON.sort(function (a, b) {
      return b.precio - a.precio
    });
  } else if (seleccion == "alfabetico") {
    productosJSON.sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });
  }
  // Se llama de nuevo la funcion luego de ordenar
  $(".card-product").remove();
  productCards();
}

//clase para cargar productos en el carrito y modificar sus cantidades
class ProductoCarrito {
  constructor(prod) {
    this.id = prod.id;
    this.foto = prod.foto;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
  }
}

//funcion para agregar productos al carrito, modificando el modal con el detalle del carrito
function agregarAlCarrito(productoAgregado) {
  let encontrado = carrito.find(p => p.id == productoAgregado.id);
  if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire({
      icon: 'success',
      title: 'Nuevo producto agregado al carrito',
      text: productoAgregado.nombre,
      confirmButtonColor: "#444444"
    });
    //se agrega una nueva fila a la tabla de carrito en caso de que el producto no se encontrara 
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);
  } else {
    //se pide al carro la posicion del producto y despues incremento su cantidad
    let posicion = carrito.findIndex(p => p.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
  }
  $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  mostrarEnTabla();
}

//funcion para rehacer la tabla del modal cada vez que se refresca la pagina y eliminar productos del carrito
function mostrarEnTabla() {
  $("#tablabody").empty();
  for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
      let eliminado = carrito.findIndex(p => p.id == prod.id);
      carrito.splice(eliminado, 1);
      console.log(eliminado);
      $(`#fila${prod.id}`).remove();
      $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
      localStorage.setItem("carrito", JSON.stringify(carrito));
    })
  }
};

//funcion para calcular el monto total del 🛒🛒 y la cantidad 
function calcularTotalCarrito() {
  let total = 0;
  for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
  }
  $("#montoTotalCompra").text(total);
  $("#cantidad-compra").text(carrito.length);
  return total;
}

//Reseteo los valores 😇. 
function vaciarCarrito() {
  $("#gastoTotal").text("Total: $0");
  $("#cantidad-compra").text("0");
  $(".tabla-carrito").remove();
  localStorage.clear();
  carrito = [];
}
