import React from "react";
import {useNavigate } from "react-router-dom";
import "../styles/GasBook.css";

const GasBook = () => {
    const navigate = useNavigate();

  const handleBookGas = () => {navigate("/newconnection") };

  return (
    <div className="book-page-container">
      <h2>Book Your Gas</h2>
      <button className="book-gas-button" onClick={handleBookGas}>
        Book Gas Now
      </button>
    </div>
  );
};

export default GasBook;
