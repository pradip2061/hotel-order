import React, { useState, useEffect, useRef } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  placeOrder,
  clearMessage,
  fetchMenuItems,
} from "../../../store/order/orderSlice";
import { toast } from "react-toastify";

export default function NewOrder() {
  const dispatch = useDispatch();
  const { loading, message, menuItems } = useSelector((state) => state.order);
  const token = localStorage.getItem("token");

  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [qtyType, setQtyType] = useState("Full Plate");
  const [quantity, setQuantity] = useState(1);
  const [tableNumber, setTableNumber] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);

  const searchRef = useRef(null);

  /* ===== ALERT ONCE ===== */
  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [message, dispatch]);

  /* ===== FETCH MENU ===== */
  useEffect(() => {
    if (!menuItems.length) {
      dispatch(fetchMenuItems(token));
    }
  }, [dispatch, token, menuItems.length]);

  /* ===== CLICK OUTSIDE TO CLOSE SUGGESTION ===== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setQuery("");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /* ===== SEARCH ===== */
  const suggestions = menuItems.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  /* ===== ADD TO CART (OK BUTTON) ===== */
  const addItemToCart = () => {
    if (!selectedItem) return;

    const exists = cartItems.find(
      (i) => i.name === selectedItem.name && i.quantityType === qtyType
    );

    if (exists) {
      setCartItems((prev) =>
        prev.map((i) =>
          i === exists ? { ...i, quantity: i.quantity + quantity } : i
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          name: selectedItem.name,
          price: selectedItem.price,
          quantityType: qtyType,
          quantity,
        },
      ]);
    }

    setSelectedItem(null);
    setQuery("");
    setQuantity(1);
    setQtyType("Full Plate");
  };

  /* ===== REMOVE ITEM ===== */
  const removeItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  /* ===== TOTAL ===== */
  const total = cartItems.reduce((sum, i) => {
    const multiplier = i.quantityType === "Half Plate" ? 0.5 : 1;
    return sum + i.price * i.quantity * multiplier;
  }, 0);

  /* ===== PLACE ORDER ===== */
  const handlePlaceOrder = () => {
    if (!tableNumber) return alert("Enter table number");
    if (!cartItems.length) return alert("Add at least one item");

    dispatch(
      placeOrder({
        orderData: {
          tableNumber,
          items: cartItems,
          customerMessage,
        },
        token,
      })
    );

    setCartItems([]);
    setTableNumber("");
    setCustomerMessage("");
  };

  return (
    <div className="w-full px-4 py-6 flex justify-center">
      <div className="w-full max-w-xl bg-[#efe7dc] rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-3xl font-serif">New Order</h2>

        {/* TABLE NUMBER */}
        <input
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          placeholder="Table Number"
          className="w-full px-4 py-3 rounded-lg border"
        />

        {/* SEARCH */}
        <div className="relative" ref={searchRef}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search item"
            className="w-full px-4 py-3 rounded-lg border"
          />

          {query && (
            <ul className="absolute w-full bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
              {suggestions.map((item, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setSelectedItem(item);
                    setQuery(item.name);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                >
                  <span>{item.name}</span>
                  <span>Rs. {item.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SELECT OPTIONS + OK */}
        {selectedItem && (
          <div
            className="
    bg-white p-3 rounded-lg mt-12
    flex flex-col gap-3
    sm:flex-row sm:items-center sm:gap-3
  "
          >
            {/* Item info */}
            <div className="flex-1">
              <p className="font-semibold text-sm sm:text-base">
                {selectedItem.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Rs. {selectedItem.price}
              </p>
            </div>

            {/* Qty type */}
            <select
              value={qtyType}
              onChange={(e) => setQtyType(e.target.value)}
              className="
        w-full sm:w-auto
        px-2 py-2 border rounded
        text-sm
      "
            >
              <option>Full Plate</option>
              <option>Half Plate</option>
              <option>Custom</option>
            </select>

            {/* Quantity */}
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(+e.target.value)}
              className="
        w-full sm:w-20
        px-2 py-2 border rounded
        text-sm
      "
            />

            {/* Button */}
            <button
              onClick={addItemToCart}
              className="
        w-full sm:w-auto
        bg-green-600 text-white
        px-4 py-2 rounded
        text-sm font-medium
      "
            >
              OK
            </button>
          </div>
        )}

        {/* CART */}
        {cartItems.length > 0 && (
          <div className="space-y-3">
            {cartItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantityType} × {item.quantity}
                  </p>
                </div>
                <button onClick={() => removeItem(i)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CUSTOMER MESSAGE */}
        <textarea
          value={customerMessage}
          onChange={(e) => setCustomerMessage(e.target.value)}
          placeholder="Customer message"
          className="w-full px-4 py-3 rounded-lg border"
        />

        {/* TOTAL */}
        <div className="text-right font-semibold text-lg">
          Total: Rs. {total}
        </div>

        {/* PLACE ORDER */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-[#355f3d] text-white py-3 rounded-lg flex justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" />}
          Place Order
        </button>
      </div>
    </div>
  );
}
