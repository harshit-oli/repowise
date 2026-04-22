import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

//local storage m save ho gya h
const getInitialCooldown = () => {
  const saved = localStorage.getItem("cooldownEnd");

  if (!saved) return 0;

  const diff = Math.floor((saved - Date.now()) / 1000);

  return diff > 0 ? diff : 0;
};

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(getInitialCooldown());
  const location = useLocation();

  const navigate = useNavigate();
  const dispatch=useDispatch()

   useEffect(() => {
     if (!sessionStorage.getItem("canVerify")) {
       navigate("/signup", { replace: true });
     }
   }, [navigate]);

  //////////----- verify otp hai yha -----//////////
  const handleVerify = async () => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/verifyRegisterOtp`,
        { otp },
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.removeItem("cooldownEnd");
         sessionStorage.removeItem("canVerify");
         dispatch(setUserData(res.data.user));
         navigate("/");
      }

    } catch (error) {
      console.log(error.response?.data?.message || error.message);

      if (error.response?.status === 401) {
        navigate("/signup");
      }
    }
  };

  ////////////////// RESEND OTP HAI YE SAMAJ RHE HI /////////////////
  const resendOtp = async () => {
    try {
      if (cooldown > 0) return;

      const res = await axios.get(
        `${serverUrl}/api/auth/againOtp`,
        { withCredentials: true }
      );

      console.log(res.data);

      // set 5 min cooldown ke liye
      const endTime = Date.now() + 300 * 1000; 

      localStorage.setItem("cooldownEnd", endTime);

      setCooldown(300);

    } catch (error) {
      console.log(error.response?.data?.message || error.message);

      if (error.response?.status === 401) {
        navigate("/signup");
      }
    }  
  };
  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem("cooldownEnd");
      return;
    }

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);
  const formatTime = (sec) =>
    `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;



  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-900 text-white">

      <div className="bg-white text-black p-6 rounded-xl w-[350px] flex flex-col gap-4">

        <h2 className="text-xl font-bold">OTP Verification</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          className="border p-2 rounded"
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={resendOtp}
          disabled={cooldown > 0}
          className="text-blue-600 text-sm self-start disabled:text-gray-400"
        >
          {cooldown > 0
            ? `Resend OTP in ${formatTime(cooldown)}`
            : "Resend OTP"}
        </button>
        <button
          onClick={handleVerify}
          className="bg-black text-white p-2 rounded"
        >
          Verify OTP
        </button>

      </div>
    </div>
  );
};

export default VerifyEmail;