import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Cart from "../components/Cart";

import { QUERY_PRODUCTS } from "../utils/queries";
import spinner from "../assets/spinner.gif";
import { useSelector, useDispatch } from "react-redux";
import {
  updateProduct,
  deleteFromCart,
  updateCartQuantity,
  add2Cart,
} from "../redux/ecommerce/ecommerceSlice";
import { idbPromise } from "../utils/helpers";

function Detail() {
  const { products, cart } = useSelector((state) => state.ecommerce);
  const dispatch = useDispatch();
  const { id } = useParams();

  const [currentProduct, setCurrentProduct] = useState({});

  const { loading, data } = useQuery(QUERY_PRODUCTS);
  
  useEffect(() => {
    if (products.length) {
      setCurrentProduct(products.find((product) => product._id === id));
    } else if (data) {
      dispatch(updateProduct(data.products));

      data.products.forEach((product) => {
        idbPromise("products", "put", product);
      });
    } else if (!loading) {
      idbPromise("products", "get").then((products) => {
        dispatch(updateProduct(products));
      });
    }
  }, [products, data, dispatch, id, loading]);

  const addToCart = () => {
    const itemInCart = cart.find((cartItem) => cartItem._id === id);

    if (itemInCart) {
      dispatch(
        updateCartQuantity({
          _id: id,
          purchaseQuantity: itemInCart.purchaseQuantity + 1,
        })
      );

      idbPromise("cart", "put", {
        ...itemInCart,
        purchaseQuantity: parseInt(itemInCart.purchaseQuantity) + 1,
      });
    } else {
      dispatch(
        add2Cart({
          ...currentProduct,
          purchaseQuantity: 1,
        })
      );
      idbPromise("cart", "put", {
        ...currentProduct,
        purchaseQuantity: 1,
      });
    }
  };

  const removeFromCart = () => {
    dispatch(
      deleteFromCart({
        _id: currentProduct._id,
      })
    );

    idbPromise("cart", "delete", {
      ...currentProduct,
    });
  };

  return (
    <>
      {currentProduct ? (
        <div className="container my-1">
          <Link to="/">??? Back to Products</Link>

          <h2>{currentProduct.name}</h2>

          <p>{currentProduct.description}</p>

          <p>
            <strong>Price:</strong>${currentProduct.price}{" "}
            <button onClick={addToCart}>Add to Cart</button>
            <button
              disabled={!cart.find((p) => p._id === currentProduct._id)}
              onClick={removeFromCart}
            >
              Remove from Cart
            </button>
          </p>

          <img
            src={`/images/${currentProduct.image}`}
            alt={currentProduct.name}
          />
        </div>
      ) : null}
      {loading ? <img src={spinner} alt="loading" /> : null}
      <Cart />
    </>
  );
}

export default Detail;
