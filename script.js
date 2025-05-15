let carrito = [];
const contenedorProductos = document.getElementById("productos-container");
const contenedorCarrito = document.getElementById("carrito-container");
const totalCarrito = document.getElementById("total");
const btnFinalizar = document.getElementById("btn-finalizar");

productos.forEach((producto, index) => {
    const productoDiv = document.createElement("div");
    productoDiv.classList.add("producto"); 

    const isOutOfStock = producto.stock === 0;

    productoDiv.innerHTML = `
        <h2>${producto.nombre}</h2>
        <p>Precio: $${producto.precio}</p>
        <p class="stock">Stock: <span id="stock-${index}">${producto.stock}</span> disponibles</p>
        <button class="btn-comprar" data-index="${index}" ${isOutOfStock ? "disabled" : ""}>
        ${isOutOfStock ? "Sin stock" : "Comprar"}
        </button>
    `;

    contenedorProductos.appendChild(productoDiv);
});

document.querySelectorAll(".btn-comprar").forEach(boton => {
    boton.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");
        agregarAlCarrito(index);
    });
});

// Crear botón para vaciar carrito
const btnVaciar = document.createElement("button");
btnVaciar.id = "btn-vaciar";
btnVaciar.textContent = "Vaciar Carrito";
btnVaciar.style.display = "none";
btnFinalizar.parentNode.insertBefore(btnVaciar, btnFinalizar);

function agregarAlCarrito(index) {
    index = parseInt(index);
    if (productos[index].stock > 0) {
        productos[index].stock--;
        document.getElementById(`stock-${index}`).textContent = productos[index].stock;
        let productoEnCarrito = carrito.find(item => item.nombre === productos[index].nombre);
        //Ternario
        productoEnCarrito?productoEnCarrito.cantidad++:carrito.push({ ...productos[index], cantidad: 1 });
        actualizarCarrito();

    if (productos[index].stock === 0) {
        const boton = document.querySelector(`.btn-comprar[data-index="${index}"]`);
        boton.disabled = true;
        boton.textContent = "Sin stock";
    }
s
    } else {
        alert("No hay más stock disponible");
    }
}

function quitarDelCarrito(index) {
    index = parseInt(index);
    let item = carrito[index];
    // Ternario 
    item.cantidad > 1 ? item.cantidad--: carrito.splice(index, 1);
    let productoOriginal = productos.find(p => p.nombre === item.nombre);
    productoOriginal.stock++;
    document.getElementById(`stock-${productos.indexOf(productoOriginal)}`).textContent = productoOriginal.stock;
    actualizarCarrito();

    if (productoOriginal.stock === 1) { // es decir, vuelve de 0 a 1
        const boton = document.querySelector(`.btn-comprar[data-index="${productos.indexOf(productoOriginal)}"]`);
        boton.disabled = false;
        boton.textContent = "Comprar";
    }    
}

function actualizarCarrito() {
    contenedorCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((item, i) => {
        const carritoItem = document.createElement("div");
        carritoItem.classList.add("carrito-item");

        carritoItem.innerHTML = `
            <h3>${item.nombre}</h3> 
            <p> $${item.precio} x ${item.cantidad}</p>
            <button class="btn-quitar" data-index="${i}">-1</button>
            <button class="btn-aumentar" data-index="${i}">+1</button>
        `;
        contenedorCarrito.appendChild(carritoItem);
        total += item.precio * item.cantidad;
    });

    totalCarrito.textContent = total;
    btnFinalizar.style.display = carrito.length > 0 ? "block" : "none";
    btnVaciar.style.display = carrito.length > 0 ? "block" : "none";

    document.querySelectorAll(".btn-quitar").forEach(boton => {
        boton.addEventListener("click", (event) => quitarDelCarrito(event.target.getAttribute("data-index")));
    });
    
    document.querySelectorAll(".btn-aumentar").forEach(boton => {
        boton.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            let item = carrito[index];
            let productoOriginal = productos.find(p => p.nombre === item.nombre);
            if (productoOriginal.stock > 0) {
                item.cantidad++;
                productoOriginal.stock--;
                document.getElementById(`stock-${productos.indexOf(productoOriginal)}`).textContent = productoOriginal.stock;
                actualizarCarrito();
            }
        });
    });
}

btnFinalizar.addEventListener("click", () => {
    if (carrito.length > 0) {
        Swal.fire({
            title: "¡Compra realizada!",
            text: "Tu pedido ha sido procesado con éxito.",
            icon: "success",
            confirmButtonText: "OK"
        });
        carrito = [];
        actualizarCarrito();
    }
});

btnVaciar.addEventListener("click", () => {
    carrito.forEach(item => {
        let productoOriginal = productos.find(p => p.nombre === item.nombre);
        productoOriginal.stock += item.cantidad;
    });
    carrito = [];
    actualizarCarrito();
});

// agregar funciones a "Buscar"

const inputBusqueda = document.getElementById("input-busqueda");
const btnBuscar = document.getElementById("btn-buscar");
const selectOrden = document.getElementById("orden-opciones");

btnBuscar.addEventListener("click", () => {
    aplicarFiltrosYOrden();
});

selectOrden.addEventListener("change", () => {
    aplicarFiltrosYOrden();
});

function mostrarProductos(productosFiltrados) {
    contenedorProductos.innerHTML = "";

    productosFiltrados.forEach((producto, index) => {
        const productoDiv = document.createElement("div");
        productoDiv.classList.add("producto");

        const isOutOfStock = producto.stock === 0;

        productoDiv.innerHTML = `
            <h2>${producto.nombre}</h2>
            <p>Precio: $${producto.precio}</p>
            <p class="stock">Stock: <span id="stock-${index}">${producto.stock}</span> disponibles</p>
            <button class="btn-comprar" data-index="${index}" ${isOutOfStock ? "disabled" : ""}>
                ${isOutOfStock ? "Sin stock" : "Comprar"}
            </button>
        `;

        contenedorProductos.appendChild(productoDiv);
    });

    document.querySelectorAll(".btn-comprar").forEach(boton => {
        boton.addEventListener("click", (event) => {
            const index = event.target.getAttribute("data-index");
            agregarAlCarrito(index);
        });
    });
}

// agregarle funcionabilidad a "Ordenar por"

function aplicarFiltrosYOrden() {
    const texto = inputBusqueda.value.toLowerCase();
    const orden = selectOrden.value;

    let productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto)
    );

    switch (orden) {
        case "alfabetico":
            productosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case "menor-precio":
            productosFiltrados.sort((a, b) => a.precio - b.precio);
            break;
        case "mayor-precio":
            productosFiltrados.sort((a, b) => b.precio - a.precio);
            break;
    }

    mostrarProductos(productosFiltrados);
}

mostrarProductos(productos);




