import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";

const Menu = ({ currentPage }) => {
  const openLiquid = () => {
    window.location.href = "/liquiddnb";
  };

  const openGlitch = () => {
    window.location.href = "/";
  };

  const openDubstep = () => {
    window.location.href = "/dubstep";
  };

  const openLofi = () => {
    window.location.href = "/lofi";
  };

  return (
    <>
      <div className="flex sm:flex-row mt-3 sm:mt-4 flex-col mb-3 ">
        <button
          type="button"
          className={`m-1 inline-block ${
            currentPage === "glitch"
              ? `border-2 border-white ${styles.animatedborder2} scale-110 rotate-2 bg-amber-500 shadow-lg opacity-85`
              : ""
          } px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-amber-900 to-orange-500 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85`}
          onClick={() => openGlitch()}
        >
          GLITCH HOP
        </button>

        <button
          type="button"
          className={`${
            currentPage === "liquid"
              ? `border-2 border-white ${styles.animatedborder2} scale-110 rotate-2 bg-amber-500 shadow-lg opacity-85`
              : ""
          } m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-emerald-900 to-lime-500 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85`}
          onClick={() => openLiquid()}
        >
          Liquid DNB
        </button>
        <button
          type="button"
          className={`${
            currentPage === "dubstep"
              ? `border-2 border-white ${styles.animatedborder2} scale-110 rotate-2 bg-amber-500 shadow-lg opacity-85`
              : ""
          } m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-red-900 to-orange-700 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500 hover:shadow-lg active:opacity-85`}
          onClick={() => openDubstep()}
        >
          DUBSTEP
        </button>

        <button
          type="button"
          className={`${
            currentPage === "lofi"
              ? `border-2 border-white ${styles.animatedborder2} scale-110 rotate-2 bg-amber-500 shadow-lg opacity-85`
              : ""
          } m-1 inline-block px-3 py-3 mr-3 font-bold text-center text-white uppercase align-middle transition-all rounded-lg cursor-pointer bg-gradient-to-tl from-blue-900 to-indigo-300 leading-pro text-xs ease-soft-in tracking-tight-soft shadow-soft-md bg-150 bg-x-25 hover:scale-110 hover:rotate-2 hover:bg-amber-500  hover:shadow-lg active:opacity-85`}
          onClick={() => openLofi()}
        >
          LOFI
        </button>
      </div>
    </>
  );
};

export default Menu;
